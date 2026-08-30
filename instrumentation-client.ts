// Bundle the session-replay recorder so replay doesn't depend on a runtime
// fetch from PostHog's CDN, which ad blockers commonly block.
import 'posthog-js/dist/posthog-recorder'
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2026-05-30'
})
