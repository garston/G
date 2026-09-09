namespace GTxt {
    export namespace Compression {
        export const compress = (str: string) => {
            return str.
                split(' ').
                map(word => JSUtil.StringUtil.capitalize(word)).
                join('');
        };

        export const decompress = (str: string) => {
            return str.split('').map((ch, i, str) => {
                const prevCh = str[i - 1];
                if(/[.!?]/.test(prevCh) || (!/[\d:;]/.test(prevCh) && /[\d:;]/.test(ch))){
                    return ' ' + ch;
                } else if(prevCh && /[A-Z]/.test(ch)){
                    return ' ' + ch.toLowerCase();
                }
                return ch;
            }).join('');
        };

        export const isCompressed = (str: string) => !str.includes(' ');
    }
}
