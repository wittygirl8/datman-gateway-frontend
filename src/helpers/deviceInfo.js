export const GetDeviceInfo = () => {
    let screen_width = (window && window.screen ? window.screen.width : '0');
    let screen_height = (window && window.screen ? window.screen.height : '0');
    let screen_depth = (window && window.screen ? window.screen.colorDepth : '0');

    let deviceIdentity = (window && window.navigator ? window.navigator.userAgent : '');
    let language = (window && window.navigator ? (window.navigator.language ? window.navigator.language : window.navigator.browserLanguage) : '');
    let timezone = (new Date()).getTimezoneOffset();

    return {
        deviceChannel: 'browser',
        deviceScreenResolution: screen_width + 'x' + screen_height + 'x' + screen_depth,
        deviceIdentity: deviceIdentity,
        deviceAcceptContent: 'application/x-www-form-urlencoded',
        deviceAcceptEncoding: 'gzip, deflate, br',
        deviceAcceptLanguage: language,
        deviceTimeZone: timezone
    }
}
