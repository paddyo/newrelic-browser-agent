import { Agent } from '@newrelic/browser-agent/loaders/agent'
import { Ajax } from '@newrelic/browser-agent/features/ajax'
import { JSErrors } from '@newrelic/browser-agent/features/jserrors'
import { Metrics } from '@newrelic/browser-agent/features/metrics'
import { PageAction } from '@newrelic/browser-agent/features/page_action'
import { PageViewEvent } from '@newrelic/browser-agent/features/page_view_event'
import { PageViewTiming } from '@newrelic/browser-agent/features/page_view_timing'
import { SessionTrace } from '@newrelic/browser-agent/features/session_trace'
import { Spa } from '@newrelic/browser-agent/features/spa'

new Agent({
  features: [
    Ajax,
    JSErrors,
    Metrics,
    PageAction,
    PageViewEvent,
    PageViewTiming,
    SessionTrace,
    Spa
  ],
  loaderType: 'spa'
})
