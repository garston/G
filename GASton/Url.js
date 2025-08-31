GASton.Url = {};

GASton.Url.post = function(url, params){
    params = { ...params, method: 'post' };
    GASton.checkProdMode(`${GASton.UPDATE_TYPES.URL.FETCH} ${url} ${JSON.stringify(params)}`) &&
        UrlFetchApp.fetch(url, params);
};
