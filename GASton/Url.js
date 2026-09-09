namespace GASton {
    export namespace Url {
        // !!!! params should be partial<UrlFetchApp.fetch.params>
        export const post = (url: string, params: object) => {
            params = { ...params, method: 'post' };
            GASton.checkProdMode(`${GASton.UPDATE_TYPES.URL.FETCH} ${url} ${JSON.stringify(params)}`) &&
                UrlFetchApp.fetch(url, params);
        };
    }
}
