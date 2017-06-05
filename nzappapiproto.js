(function(global, factory) {

    /* AMD */ if (typeof define === 'function' && define['amd'])
        define([], factory);
    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module['exports'])
        module['exports'] = factory();
    /* Global */ else
        (global['netzyn'] = global['netzyn'] || {})['nzappapiproto'] = factory();

})(this, function () {
    return {
      baseMsgId : 0x1100,
      namespace: 'nzappapi',
      // An array of objects maybe later add response message to message?
      messages: [
        { name: 'AppLaunch'},
        { name: 'AppLaunchResp'},
        { name: 'AppLaunchFailed'},
        { name: 'AppUpdate'},
        { name: 'AppActivate'},
        { name: 'AppVisibilityChanged'},
        { name: 'AppClose'},
        { name: 'AppKey'},
        { name: 'AppVisible'},
        { name: 'AppShutdown'},
        { name: 'AppRegisterOid'},
        { name: 'AppReleaseOid'},
        { name: 'AppSendRawMessage'},
        { name: 'AppRcvRawMessage'},
        { name: 'RegisterEvents'},
        { name: 'AppTouch'},
        { name: 'AppLocation'},
        { name: 'AppMediaInit'},
        { name: 'AppMediaUrl'},
        { name: 'AppMediaReport'},
        { name: 'AppUrlReport'},
        { name: 'AppMediaClose'},
        { name: 'AppMediaPlay'},
        { name: 'AppMediaPause'},
        { name: 'AppMediaSeek'},
        { name: 'AppMediaSetQueueSize'},
        { name: 'AppMediaSetVolume'},
        { name: 'AppMediaEndOfStream'},
        { name: 'AppConfigRequest'},
        { name: 'AppConfigResponse'},
        { name: 'AppGetUserProperty'},
        { name: 'AppGetUserPropertyResponse'},
        { name: 'AppGetInfo'},
        { name: 'AppGetInfoResponse'},
        { name: 'AppMediaStreamCreate'},
        { name: 'AppMediaStreamUpdate'},
        { name: 'AppMediaStreamVolume'},
        { name: 'AppSendMarker'},
        { name: 'AppCommandReq'},
        { name: 'AppCommandResp'}
      ]
    }
});

