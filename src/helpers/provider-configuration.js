import {baseUrl} from '../config/baseUrl'

export const GetProviderConfig = (provider) => {
    var url = baseUrl.earth
    var name = 'earth';

    if(provider == 'OPTOMANY'){
        url = baseUrl.pluto
        name = 'pluto'
    }

    return { url, name }
}

