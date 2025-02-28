// Reset config values back to released
window.NREUM.loader_config.agentID = '{{{args.appId}}}'
window.NREUM.loader_config.applicationID = '{{{args.appId}}}'
window.NREUM.loader_config.licenseKey = '{{{args.licenseKey}}}'
window.NREUM.info.applicationID = '{{{args.appId}}}'
window.NREUM.info.licenseKey = '{{{args.licenseKey}}}'

// Session replay entitlements check
try {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', '/graphql')
  xhr.setRequestHeader('authority', '${entitlementsEndpoints[environment]}')
  xhr.setRequestHeader('cache-control','no-cache')
  xhr.setRequestHeader('content-type', 'application/json; charset=utf-8')
  xhr.setRequestHeader('newrelic-requesting-services','platform|nr1-ui')
  xhr.setRequestHeader('pragma','no-cache')

  xhr.send(
    JSON.stringify({
      'query': 'query PlatformEntitlementsQuery($names: [String]!) { currentUser { id authorizedAccounts { id entitlements(filter: {names: $names}) { name __typename } __typename } __typename } }',
      'variables': {
        'names': [
          'hipaa',
          'fedramp'
        ]
      }
    })
  )

  xhr.addEventListener('load', function(evt){
    try{
      var entitlementsData = JSON.parse(evt.currentTarget.responseText)
      // call the newrelic api(s) after evaluating entitlements...
      var canRunSr = true
      if (entitlementsData.data && entitlementsData.data.currentUser && entitlementsData.data.currentUser.authorizedAccounts && entitlementsData.data.currentUser.authorizedAccounts.length) {
        for (var i = 0; i < entitlementsData.data.currentUser.authorizedAccounts.length; i++){
          var ent = entitlementsData.data.currentUser.authorizedAccounts[i]
          if (!ent.entitlements || !ent.entitlements.length) continue
          for (var j = 0; j < ent.entitlements.length; j++){
            if (ent.entitlements[j].name === 'fedramp' || ent.entitlements[j].name === 'hipaa') canRunSr = false
          }
        }
      }
      if (canRunSr && newrelic && !!newrelic.start) newrelic.start('session_replay')
    } catch(e){
      // something went wrong...
      if (!!newrelic && !!newrelic.noticeError) newrelic.noticeError(e)
    }
  })
} catch(err){
  // we failed our mission....
  if (!!newrelic && !!newrelic.noticeError) newrelic.noticeError(err)
}

{{#if (isEnvironment args.environment 'staging')}}
if (!!newrelic && !!newrelic.setApplicationVersion) newrelic.setApplicationVersion( '' + Math.floor(Math.random() * 10) + '.' + Math.floor(Math.random() * 10) + '.' + Math.floor(Math.random() * 10) )
{{/if}}
