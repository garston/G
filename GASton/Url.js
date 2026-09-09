namespace GASton {
    export namespace Url {
        export const post = (url: string, params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions) => {
            params = { ...params, method: 'post' };
            checkProdMode(`${UPDATE_TYPES.URL.FETCH} ${url} ${JSON.stringify(params)}`) &&
                UrlFetchApp.fetch(url, params);
        };
    }
}
