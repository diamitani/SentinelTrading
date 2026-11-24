# Sentinel Trading: Sign-up Funnel Analysis

How a stranger becomes an activated user, what we measure at every step, where people are most likely to drop off, and what to test next.

**Activation definition:** a new user gets their **first live, sourced answer** from Ask Sentinel. That's the "aha" moment. Everything before it is friction to remove; everything after it is retention.

---

## 1. The funnel

| # | Step | Event (`funnel_events.event`) | What it tells you |
|---|------|-------------------------------|-------------------|
| 1 | Saw landing page | `landing_view` | Top of funnel (logged-out visits) |
| 2 | Clicked a "Start free" button | `cta_click` (`props.where` = `nav` / `hero` / `plan_beginner` / `plan_active` / `plan_pro` / `footer_band`) | Is the page convincing? Which spot converts? |
| 3 | Chose a plan | `signup_plan_selected` (+ `plan`) | Step 1 of the wizard done |
| 4 | Created account | `signup_account_created` | Step 2 done: the real conversion |
| 5 | Saw the AI-key step | `signup_ai_key_view` | Step 3 reached |
| 6 | Connected AI key | `signup_ai_key_connected` | **Biggest risk step** (see §3) |
| — | Skipped the key | `signup_ai_key_skipped` | Escape hatch usage |
| — | Pasted a bad key | `signup_ai_key_invalid` (`props.reason` = `format` / `rejected`) | Instructions not clear enough |
| 7 | Reached dashboard | `dashboard_first_view` (`props.has_ai_key`) | Onboarding finished |
| 8 | Asked first question | `first_question_asked` | Intent to use |
| 9 | Got first answer | `first_answer_received` | **Activated** |
| — | Hit "connect your key" wall | `needs_key_shown` (`props.reason`) | Skippers coming back, or keys failing |

`signup_view` also fires when the sign-up page opens (includes direct visits that skip the landing page).

Events are anonymous: a random browser id plus the step name. No emails, names or keys are ever sent (`/api/track` rejects anything else).

---

## 2. How to read it

1. In Supabase, run `supabase/migrations/20261124000000_rostr_hub_and_funnel.sql` once (SQL Editor → paste → Run).
2. Then any time:

```sql
select * from funnel_report;              -- visitors per step, % of start, % of previous step
```

```sql
-- Which CTA converts best
select props->>'where' as spot, count(distinct anon_id) as visitors
from funnel_events where event = 'cta_click' and created_at > now() - interval '30 days'
group by 1 order by 2 desc;
```

```sql
-- AI-key step outcome split
select event, count(distinct anon_id) from funnel_events
where event in ('signup_ai_key_view','signup_ai_key_connected','signup_ai_key_skipped','signup_ai_key_invalid')
  and created_at > now() - interval '30 days'
group by 1;
```

```sql
-- Time from account created to first answer (minutes, median)
with a as (select anon_id, min(created_at) t from funnel_events where event='signup_account_created' group by 1),
     b as (select anon_id, min(created_at) t from funnel_events where event='first_answer_received' group by 1)
select percentile_cont(0.5) within group (order by extract(epoch from b.t - a.t)/60) as median_minutes
from a join b using (anon_id);
```

Read **% of previous step**: it points at the exact step to fix. Don't judge until a step has ~100 visitors; below that, swings are noise.

---

## 3. Step-by-step friction audit

| Step | Friction | What we already did | Risk |
|------|----------|---------------------|------|
| Landing → CTA | Unclear value, distrust of finance apps | One clear promise, honest copy, "Free · No card" under the CTA, example answer with sources, 4 CTA spots | Low–medium |
| CTA → plan | Choice overload | Beginner preselected and labeled "Best place to start"; plan chosen on the landing page carries through | Low |
| Plan → account | Form length, risk checkbox | 3 fields + 1 checkbox; plain-English risk statement replaces a blocking popup | Medium |
| Account → AI key | **Leaving the site to get a key**, unfamiliar term "API key", fear about security | Asked only *after* the account exists (no lost sign-ups); 3 numbered steps; "Open in new tab" so they don't lose our page; key checked with Google before saving; reassurance line about where it's stored; first-time sign-ups only | **High: expect the largest drop here** |
| Key → dashboard | Bad key pasted | Two-stage check (format, then Google) with a specific error message each time | Medium |
| Dashboard → first question | Blank-page problem | Welcome checklist with a one-click starter question matched to the plan | Low |
| Question → answer | Slow multi-pass research (15–45s), key quota limits | Live progress: every PAL / NPAO / RAG DAL step is shown as it happens; clear card if the key is rejected or rate-limited | Medium |

**Judgment call for you:** the AI-key step has a small "I'll connect it later" link. Removing it would force 100% of finishers to connect a key, but people who can't or won't would abandon instead of becoming reachable users. Keep the link until `funnel_report` shows how many skip, then decide with data.

---

## 4. Targets to set (fill in after 2 weeks of data)

Benchmarks vary too much by traffic source to quote reliably, so set your own baseline first, then improve against it.

| Conversion | Baseline (week 1–2) | Target |
|------------|---------------------|--------|
| Landing → CTA click | | |
| CTA → account created | | |
| Account → key connected | | |
| Key connected → first answer | | |
| **Landing → activated (first answer)** | | |

---

## 5. Experiments to run next (in order)

1. **Key step video.** A 20-second screen recording of getting the key, embedded in step 3. Measure: `signup_ai_key_connected / signup_ai_key_view`.
2. **Copy test on the key step headline:** "Turn on live research" vs "Connect your free research AI (1 minute)".
3. **Return reminder for skippers.** Email skippers the 3-step guide 1 hour later (needs Resend + an opt-in). Measure: `needs_key_shown → signup_ai_key_connected`.
4. **Hosted-AI option for paid plans.** For Active/Pro, run research on a Sentinel-owned key (no BYOK step at all). This is the single biggest lever on step 6, and it pairs naturally with Stripe billing.
5. **Starter question test.** Different first-question suggestions by plan; measure `first_answer_received / dashboard_first_view`.

---

## 6. What changed in the product for this funnel

- Demo answers removed. Research is live only; without a key the user sees a clear "Connect your AI" card, never fake text.
- Sign-up is now 3 steps: Plan → Account → AI key (first-time sign-ups only; returning log-ins skip it).
- Every step is instrumented with anonymous events (above).
