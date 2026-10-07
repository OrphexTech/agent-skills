import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('marketing_math', Path(__file__).resolve().parents[1] / 'resources/marketing_math.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class MarketingMathTests(unittest.TestCase):
    def test_weighted_ratio_uses_raw_totals_and_retains_unknown_bucket(self):
        result = m.weighted_ratio({'rows': [{'device': 'desktop', 'clicks': 1, 'impressions': 10}, {'device': 'Unknown', 'clicks': 2, 'impressions': 100}], 'numerator': 'clicks', 'denominator': 'impressions', 'scale': 100})
        self.assertAlmostEqual(result['value'], 3 / 110 * 100)
        self.assertNotAlmostEqual(result['value'], 6)

    def test_zero_is_undefined_and_missing_is_an_error(self):
        self.assertIsNone(m.weighted_ratio({'rows': [{'numerator': 0, 'denominator': 0}]})['value'])
        with self.assertRaises(m.InputError):
            m.weighted_ratio({'rows': [{'numerator': 2}]})

    def test_money_cannot_mix_currencies(self):
        with self.assertRaises(m.InputError):
            m.weighted_ratio({'money': True, 'rows': [{'currency': 'USD', 'numerator': 3, 'denominator': 2}, {'currency': 'EUR', 'numerator': 4, 'denominator': 2}]})

    def test_shared_budget_entities_and_infeasible_constraints(self):
        base = {'currency': 'USD', 'id': 'shared-1', 'current': 50, 'minimum': 40, 'maximum': 60, 'weight': 1}
        with self.assertRaises(m.InputError):
            m.reallocate({'total': 100, 'budgets': [base, base]})
        with self.assertRaises(m.InputError):
            m.reallocate({'total': 100, 'budgets': [base]})

    def test_reallocation_preserves_total_frozen_caps_and_cent_rounding(self):
        rows = [{'id': name, 'currency': 'USD', 'current': current, 'minimum': low, 'maximum': high, 'weight': weight, 'frozen': frozen} for name, current, low, high, weight, frozen in [('a', 33.34, 10, 90, 1, False), ('b', 33.33, 10, 35, 1, False), ('c', 33.33, 0, 99, 20, True)]]
        result = m.reallocate({'total': 100, 'budgets': rows})
        proposed = {row['id']: row['proposed'] for row in result['allocation']}
        self.assertEqual(proposed, {'a': 33.34, 'b': 33.33, 'c': 33.33})
        self.assertEqual(round(sum(proposed.values()), 2), 100)
        self.assertEqual(round(sum(row['delta'] for row in result['allocation']), 2), 0)

    def test_pacing_exposes_scenarios_and_overspend(self):
        result = m.pacing({'currency': 'USD', 'period_budget': 1000, 'spent': 1200, 'elapsed_days': 10, 'period_days': 20, 'future_daily_min': 50, 'future_daily_max': 100})
        self.assertEqual(result['remaining_budget'], -200)
        self.assertEqual(result['required_future_daily'], -20)
        self.assertEqual(result['scenario_min'], 1700)
        self.assertEqual(result['scenario_max'], 2200)
        with self.assertRaises(m.InputError):
            m.pacing({'currency': 'USD', 'period_budget': 1000, 'spent': 1200, 'elapsed_days': 0, 'period_days': 20, 'future_daily_min': 50, 'future_daily_max': 100})

    def test_pacing_can_report_core_metrics_without_optional_scenarios(self):
        data = {'currency': 'USD', 'period_budget': 1000, 'spent': 200, 'elapsed_days': 10, 'period_days': 20}
        result = m.pacing(data)
        self.assertEqual(result['linear_projection'], 400)
        self.assertEqual(result['required_future_daily'], 80)
        self.assertIsNone(result['scenario_min'])
        self.assertIsNone(result['scenario_max'])
        self.assertEqual(result['scenario_status'], 'unavailable-no-future-bounds')
        with self.assertRaises(m.InputError):
            m.pacing({**data, 'future_daily_min': 10})

    def test_profitability_includes_supplied_costs_not_only_roas(self):
        result = m.profitability({'products': [{'id': 'p1', 'currency': 'USD', 'gross_revenue': 1000, 'discounts': 100, 'refunds': 50, 'cost_of_goods': 500, 'fulfilment': 100, 'payment_fees': 20, 'ad_spend': 200}]})
        self.assertEqual(result['products'][0]['net_revenue'], 850)
        self.assertEqual(result['total_contribution_after_ads'], 30)
        self.assertAlmostEqual(result['products'][0]['observed_roas'], 4.25)

    def test_cohort_requires_common_mature_horizon(self):
        rows = [{'id': 'jan', 'currency': 'USD', 'customers': 100, 'observed_days': 90, 'revenue_at_common_horizon': 5000, 'acquisition_cost': 2000}]
        self.assertEqual(m.cohort({'common_observed_days': 30, 'cohorts': rows})['cohorts'][0]['observed_revenue_per_customer'], 50)
        with self.assertRaises(m.InputError):
            m.cohort({'common_observed_days': 120, 'cohorts': rows})

    def test_experiment_normal_interval_is_inconclusive(self):
        result = m.experiment({'control_trials': 1000, 'control_successes': 100, 'treatment_trials': 1000, 'treatment_successes': 110})
        self.assertEqual(result['status'], 'inconclusive')
        self.assertAlmostEqual(result['difference'], .01)
        self.assertAlmostEqual(result['ci_low'], -.016867, places=5)
        self.assertAlmostEqual(result['ci_high'], .036867, places=5)

    def test_experiment_plan_is_explicit_binary_approximation(self):
        result = m.experiment({'mode': 'plan', 'baseline_rate': .1, 'target_rate': .12, 'alpha': .05, 'power': .8})
        self.assertTrue(3830 <= result['approximate_per_arm'] <= 3850)
        self.assertEqual(result['approximate_total'], 2 * result['approximate_per_arm'])

    def test_fractional_credits_cannot_be_bernoulli_success_counts(self):
        with self.assertRaises(m.InputError):
            m.experiment({'control_trials': 1000, 'control_successes': 100.4, 'treatment_trials': 1000, 'treatment_successes': 110})
        result = m.experiment({'control_trials': 10, 'control_successes': 1, 'treatment_trials': 10, 'treatment_successes': 2})
        self.assertIsNone(result['ci_low'])
        self.assertEqual(result['status'], 'unsupported-sparse-normal-approximation')

    def test_reallocation_rejects_unsupported_minor_units_and_changed_total(self):
        row = {'id': 'a', 'currency': 'JPY', 'current': 1, 'minimum': 0, 'maximum': 2, 'weight': 1}
        with self.assertRaises(m.InputError):
            m.reallocate({'total': 1, 'budgets': [row]})
        for currency in ['KWD', 'BHD']:
            with self.assertRaises(m.InputError):
                m.reallocate({'total': 1, 'budgets': [{**row, 'currency': currency}]})
        with self.assertRaises(m.InputError):
            m.reallocate({'total': 100, 'budgets': [{**row, 'currency': 'USD', 'current': 75, 'maximum': 100}]})

    def test_extreme_probabilities_and_nonrepresentable_numbers_fail_explicitly(self):
        with self.assertRaises(m.InputError):
            m.experiment({'alpha': 1e-40, 'control_trials': 1000, 'control_successes': 100, 'treatment_trials': 1000, 'treatment_successes': 110})
        with self.assertRaises(m.InputError):
            m.number('1e1000', 'huge')
        with self.assertRaises(m.InputError):
            m.weighted_ratio({'rows': [None]})

    def test_invalid_nonfinite_boolean_and_negative_values_fail(self):
        for value in ['NaN', 'Infinity', True, -1, None]:
            with self.assertRaises(m.InputError):
                m.number(value, 'value')


if __name__ == '__main__':
    unittest.main()
