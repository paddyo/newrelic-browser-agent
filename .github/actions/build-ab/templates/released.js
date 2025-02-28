// config
window.NREUM={
  init: {
    distributed_tracing: {
      enabled: true
    },
    ajax: {
      deny_list: [
        'nr-data.net',
        'bam.nr-data.net',
        'staging-bam.nr-data.net',
        'bam-cell.nr-data.net'
      ]
    },
    session_replay: {
      enabled: true,
      sampling_rate: 50,
      error_sampling_rate: 100,
      autoStart: false,
      {{#if (isEnvironment args.environment 'dev' 'staging')}}
      mask_all_inputs: false,
      mask_text_selector: null,
      {{/if}}
    }
  },
  loader_config: {
    accountID: '1',
    trustKey: '1',
    agentID: '{{{args.appId}}}',
    licenseKey: '{{{args.licenseKey}}}',
    applicationID: '{{{args.appId}}}'
  },
  info: {
    beacon: 'staging-bam.nr-data.net',
    errorBeacon: 'staging-bam.nr-data.net',
    licenseKey: '{{{args.licenseKey}}}',
    applicationID: '{{{args.appId}}}',
    sa: 1
  }
}

{{{releasedScript}}}
