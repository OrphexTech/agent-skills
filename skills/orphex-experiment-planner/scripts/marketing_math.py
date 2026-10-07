#!/usr/bin/env python3
"""Deterministic, offline marketing arithmetic. JSON stdin -> JSON stdout.

Optional Python 3 helper; it does not fetch data or mutate advertising accounts.
All money inputs are decimal major units with a supplied currency. Reports expose
assumptions; statistical approximations are diagnostics, not causal proof.
"""
import json
import math
import sys
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, ROUND_FLOOR
from statistics import NormalDist


class InputError(ValueError):
    pass


def number(value, name, *, nonnegative=True):
    if value is None or isinstance(value, bool) or value == "":
        raise InputError(name + " is missing or not a number")
    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise InputError(name + " must be numeric") from None
    if not result.is_finite() or not math.isfinite(float(result)) or (nonnegative and result < 0):
        raise InputError(name + " must be finite" + (" and nonnegative" if nonnegative else ""))
    return result


TWO_DECIMAL_CURRENCIES = {"USD", "EUR", "GBP", "TRY", "CAD", "AUD", "NZD", "SGD", "CHF"}


def money(value, name, currency=None):
    if currency not in TWO_DECIMAL_CURRENCIES:
        raise InputError("minor-unit allocation supports only " + ", ".join(sorted(TWO_DECIMAL_CURRENCIES)) + "; normalize or use a reviewed currency-aware calculator for other currencies")
    result = number(value, name)
    if result.quantize(Decimal("0.01")) != result:
        raise InputError(name + " must have at most two decimal places; minor-unit currencies require normalization")
    return int(result * 100)


def single_currency(rows, supplied=None):
    currencies = {row.get("currency") for row in rows}
    if supplied:
        currencies.add(supplied)
    if None in currencies or "" in currencies or len(currencies) != 1:
        raise InputError("one explicit currency is required; mixed currencies cannot be added without supplied FX normalization")
    currency = next(iter(currencies))
    if not isinstance(currency, str) or len(currency) != 3 or not currency.isalpha() or currency != currency.upper():
        raise InputError("currency must be an uppercase three-letter code")
    return currency


def rows_of(data, key):
    rows = data.get(key)
    if not isinstance(rows, list) or not rows or any(not isinstance(row, dict) for row in rows):
        raise InputError(key + ' must be a non-empty array of objects')
    return rows


def weighted_ratio(data):
    rows = rows_of(data, "rows")
    if not isinstance(rows, list) or not rows:
        raise InputError("rows must be a non-empty array")
    numerator_key = data.get("numerator", "numerator")
    denominator_key = data.get("denominator", "denominator")
    if not isinstance(numerator_key, str) or not isinstance(denominator_key, str):
        raise InputError("numerator and denominator must name columns")
    numerator = sum((number(row.get(numerator_key), numerator_key) for row in rows), Decimal(0))
    denominator = sum((number(row.get(denominator_key), denominator_key) for row in rows), Decimal(0))
    currency = single_currency(rows) if data.get("money") is True else None
    scale = number(data.get("scale", 1), "scale")
    return {"numerator": float(numerator), "denominator": float(denominator), "value": float(numerator / denominator * scale) if denominator else None,
            "status": "defined" if denominator else "undefined-zero-denominator", "currency": currency, "rows": len(rows)}


def reallocate(data):
    rows = rows_of(data, "budgets")
    if not isinstance(rows, list) or not rows:
        raise InputError("budgets must be a non-empty array of unique budget entities")
    currency = single_currency(rows)
    ids = [row.get("id") for row in rows]
    if any(not isinstance(item, str) or not item for item in ids) or len(set(ids)) != len(ids):
        raise InputError("budget IDs must be unique: a shared budget is one entity")
    total = money(data.get("total"), "total", currency)
    prepared = []
    for row in rows:
        minimum = money(row.get("minimum"), row["id"] + ".minimum", currency)
        maximum = money(row.get("maximum"), row["id"] + ".maximum", currency)
        current = money(row.get("current"), row["id"] + ".current", currency)
        weight = number(row.get("weight"), row["id"] + ".weight")
        if not isinstance(row.get("frozen", False), bool):
            raise InputError("frozen must be boolean")
        if minimum > maximum or not minimum <= current <= maximum:
            raise InputError("current budget must be within supplied minimum/maximum bounds")
        if row.get("frozen", False):
            minimum = maximum = current
        prepared.append({"id": row["id"], "minimum": minimum, "maximum": maximum, "current": current, "weight": weight})
    if sum(row["current"] for row in prepared) != total:
        raise InputError("fixed total must equal the sum of current unique budget entities; a total change needs a separate authorized proposal")
    if sum(row["minimum"] for row in prepared) > total or sum(row["maximum"] for row in prepared) < total:
        raise InputError("fixed total is infeasible under supplied bounds")
    # Allocate residual above floors proportionally to supplied weights, capping
    # saturated entities and repeating. Weights express a user's scenario, not
    # learned marginal returns. Zero-weight entities receive no residual.
    amounts = [Decimal(row["minimum"]) for row in prepared]
    residual = Decimal(total) - sum(amounts)
    active = {i for i, row in enumerate(prepared) if row["weight"] > 0 and row["maximum"] > row["minimum"]}
    while residual > 0:
        if not active:
            raise InputError("positive residual cannot be assigned using supplied positive weights and bounds")
        weight_sum = sum(prepared[i]["weight"] for i in active)
        shares = {i: residual * prepared[i]["weight"] / weight_sum for i in active}
        capped = [i for i in active if shares[i] >= Decimal(prepared[i]["maximum"]) - amounts[i]]
        if not capped:
            for i, share in shares.items():
                amounts[i] += share
            residual = Decimal(0)
        else:
            for i in capped:
                capacity = Decimal(prepared[i]["maximum"]) - amounts[i]
                amounts[i] += capacity
                residual -= capacity
                active.remove(i)
    cents = [int(amount.to_integral_value(rounding=ROUND_FLOOR)) for amount in amounts]
    remainder = total - sum(cents)
    order = sorted(range(len(prepared)), key=lambda i: (-(amounts[i] - cents[i]), prepared[i]["id"]))
    for i in order:
        if remainder and cents[i] < prepared[i]["maximum"]:
            cents[i] += 1
            remainder -= 1
    if remainder or sum(cents) != total:
        raise InputError("minor-unit reconciliation failed")
    return {"currency": currency, "total": total / 100, "allocation": [{"id": row["id"], "current": row["current"] / 100,
            "proposed": cents[i] / 100, "delta": (cents[i] - row["current"]) / 100} for i, row in enumerate(prepared)],
            "method": "supplied-weight scenario above floors with caps and deterministic largest-remainder cents; no marginal-return forecast"}


def pacing(data):
    currency = single_currency([{"currency": data.get("currency")}])
    budget = money(data.get("period_budget"), "period_budget", currency)
    spent = money(data.get("spent"), "spent", currency)
    elapsed = number(data.get("elapsed_days"), "elapsed_days")
    total_days = number(data.get("period_days"), "period_days")
    if total_days <= 0 or elapsed <= 0 or elapsed > total_days:
        raise InputError("require 0 < elapsed_days <= period_days")
    remaining = total_days - elapsed
    has_lower = data.get("future_daily_min") not in (None, "")
    has_upper = data.get("future_daily_max") not in (None, "")
    if has_lower != has_upper:
        raise InputError("future daily scenario bounds must be supplied together")
    lower = number(data.get("future_daily_min"), "future_daily_min") if has_lower else None
    upper = number(data.get("future_daily_max"), "future_daily_max") if has_upper else None
    if has_lower and lower > upper:
        raise InputError("future daily lower bound cannot exceed upper bound")
    round_money = lambda value: float((value / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    return {"currency": currency, "spent": spent / 100, "period_budget": budget / 100, "remaining_budget": (budget - spent) / 100,
            "linear_projection": round_money(Decimal(spent) / elapsed * total_days),
            "scenario_min": round_money(Decimal(spent) + lower * 100 * remaining) if has_lower else None,
            "scenario_max": round_money(Decimal(spent) + upper * 100 * remaining) if has_upper else None,
            "required_future_daily": round_money(Decimal(budget - spent) / remaining) if remaining else None,
            "scenario_status": "supplied-bounds" if has_lower else "unavailable-no-future-bounds",
            "assumption": "supplied future daily bounds; linear scenario is not a spend guarantee; actual spend can exceed remaining budget"}


def profitability(data):
    rows = rows_of(data, "products")
    if not isinstance(rows, list) or not rows:
        raise InputError("products must be a non-empty array")
    currency = single_currency(rows)
    ids = [row.get("id") for row in rows]
    if len(set(ids)) != len(ids) or any(not item for item in ids):
        raise InputError("product IDs must be unique")
    results = []
    for row in rows:
        values = {key: number(row.get(key), key) for key in ["gross_revenue", "discounts", "refunds", "cost_of_goods", "fulfilment", "payment_fees", "ad_spend"]}
        net = values["gross_revenue"] - values["discounts"] - values["refunds"]
        if net < 0:
            raise InputError("discounts and refunds cannot exceed gross revenue in this simple same-period ledger")
        contribution = net - values["cost_of_goods"] - values["fulfilment"] - values["payment_fees"] - values["ad_spend"]
        results.append({"id": row["id"], "net_revenue": float(net), "contribution_after_ads": float(contribution),
                        "contribution_margin": float(contribution / net) if net else None,
                        "observed_roas": float(net / values["ad_spend"]) if values["ad_spend"] else None})
    return {"currency": currency, "products": results, "total_contribution_after_ads": float(sum((Decimal(str(row["contribution_after_ads"])) for row in results), Decimal(0))),
            "scope": "supplied same-period costs and revenue; tax, overhead, returns lag and customer lifetime value are not inferred"}


def cohort(data):
    rows = rows_of(data, "cohorts")
    if not isinstance(rows, list) or not rows:
        raise InputError("cohorts must be a non-empty array")
    currency = single_currency(rows)
    horizon = number(data.get("common_observed_days"), "common_observed_days")
    if horizon <= 0:
        raise InputError("common observed horizon must be positive")
    output = []
    for row in rows:
        customers = number(row.get("customers"), "customers")
        age = number(row.get("observed_days"), "observed_days")
        if customers <= 0 or customers != customers.to_integral_value() or age < horizon:
            raise InputError("customer counts must be positive integers and every cohort must have matured through the common horizon")
        revenue = number(row.get("revenue_at_common_horizon"), "revenue_at_common_horizon")
        acquisition = number(row.get("acquisition_cost"), "acquisition_cost")
        output.append({"id": row.get("id"), "customers": int(customers), "observed_revenue_per_customer": float(revenue / customers),
                       "acquisition_cost_per_customer": float(acquisition / customers), "observed_days": float(horizon)})
    return {"currency": currency, "cohorts": output, "scope": "observed revenue at the supplied common horizon; not profit and not a lifetime-value forecast"}


def experiment(data):
    mode = data.get("mode", "review")
    alpha = float(number(data.get("alpha", 0.05), "alpha"))
    if not 1e-12 <= alpha <= 1 - 1e-12:
        raise InputError("alpha must be within supported numerical range [1e-12, 1-1e-12]")
    z = NormalDist().inv_cdf(1 - alpha / 2)
    if mode == "plan":
        p1 = float(number(data.get("baseline_rate"), "baseline_rate"))
        p2 = float(number(data.get("target_rate"), "target_rate"))
        power = float(number(data.get("power", 0.8), "power"))
        if not 0 < p1 < 1 or not 0 < p2 < 1 or p1 == p2 or not 1e-12 <= power <= 1 - 1e-12:
            raise InputError("plan requires distinct rates strictly between zero and one and power between zero and one")
        pooled = (p1 + p2) / 2
        size = math.ceil((z * math.sqrt(2 * pooled * (1 - pooled)) + NormalDist().inv_cdf(power) * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p2 - p1) ** 2)
        return {"approximate_per_arm": size, "approximate_total": size * 2, "relative_effect": (p2 - p1) / p1,
                "absolute_effect": p2 - p1, "method": "equal-arm, independent binary-outcome two-sided normal approximation; fixed horizon, no clustering, sequential peeking or multiplicity correction"}
    if mode != "review":
        raise InputError("experiment mode must be plan or review")
    counts = {}
    for arm in ["control", "treatment"]:
        n = number(data.get(arm + "_trials"), arm + "_trials")
        k = number(data.get(arm + "_successes"), arm + "_successes")
        if n <= 0 or k > n or n != n.to_integral_value() or k != k.to_integral_value():
            raise InputError("independent binary outcomes require integer successes within positive integer trial counts")
        counts[arm] = (int(k), int(n))
    c, nc = counts["control"]
    t, nt = counts["treatment"]
    pc, pt = c / nc, t / nt
    # A normal difference interval is intentionally withheld for sparse tails.
    enough = min(c, nc - c, t, nt - t) >= 10
    if not enough:
        return {"control_rate": pc, "treatment_rate": pt, "difference": pt - pc, "ci_low": None, "ci_high": None,
                "status": "unsupported-sparse-normal-approximation", "method": "use an appropriate exact or score method; no automatic winner"}
    half = z * math.sqrt(pc * (1 - pc) / nc + pt * (1 - pt) / nt)
    lower, upper = pt - pc - half, pt - pc + half
    return {"control_rate": pc, "treatment_rate": pt, "difference": pt - pc, "ci_low": lower, "ci_high": upper,
            "status": "direction-supported-by-interval" if lower > 0 or upper < 0 else "inconclusive",
            "method": "independent binary outcomes, unpooled two-sided normal difference interval; requires valid randomization, fixed horizon and separate business guardrails"}


MODES = {"weighted-ratio": weighted_ratio, "reallocate": reallocate, "pacing": pacing, "profitability": profitability, "cohort": cohort, "experiment": experiment}


def main():
    try:
        if len(sys.argv) != 2 or sys.argv[1] not in MODES:
            raise InputError("usage: python3 -B scripts/marketing_math.py " + "|".join(MODES) + " < input.json")
        data = json.load(sys.stdin)
        if not isinstance(data, dict):
            raise InputError("input must be a JSON object")
        result = MODES[sys.argv[1]](data)
        print(json.dumps({"ok": True, "result": result}, sort_keys=True, allow_nan=False))
    except (ValueError, TypeError, KeyError, ArithmeticError) as error:
        print(json.dumps({"ok": False, "error": str(error)}, sort_keys=True))
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
