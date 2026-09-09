namespace GTxt {
    export namespace MissedCallEnabler {
        export const changeEnabled = (config: GTxt.Config) => {
            GmailApp.search(`from:${GASton.Voice.NO_REPLY_EMAIL} is:unread subject:"${GASton.Voice.MISSED_CALL_SUBJECT}" -to:me`).forEach(t => {
                t.getMessages().filter(m => !m.isInTrash() && m.isUnread() && isToggleEnabledRequest(m, config)).forEach((m, i, msgs) => {
                    GTxt.Util.mail(
                        Session.getActiveUser().getEmail(),
                        i && msgs[i-1].getDate().getTime() === m.getDate().getTime() ? 'duplicate missed call email' : config.toggleForwardToPhysicalPhone() + ' ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
                        [m]
                    );
                });
            });
        };

        const isToggleEnabledRequest = (message: GoogleAppsScript.Gmail.GmailMessage, config: GTxt.Config) => 
            [config.gvNumber, config.getPhysicalPhoneContact().number].
                    concat(JSUtil.StringUtil.splitPossiblyEmpty(config.additionalToggleEnabledNumbers.toString()).map(num => +num)).
                    includes(GASton.Voice.getFirstNumberMentioned(message.getBody()));
    }
}
