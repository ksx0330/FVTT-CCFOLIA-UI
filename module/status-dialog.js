
export class StatusDialog extends Dialog {


    constructor(token, options) {
        super(options);

        this.token = token;
        this.status = duplicate(this.token.getFlag("ccfolia-style-ui", "status"));

        this.data = {
            title: token.name,
            content: this.getContent(),
            buttons: {}
        };
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "templates/hud/dialog.html",
            classes: ["ccfolia-style-ui", "dialog"],
            width: 400
        });
    }

    /** @override */
	activateListeners(html) {
        super.activateListeners(html);
    }

    getContent() {
        let content = `
            <div class="status-list">
                <div class="state">

                </div>

        
            </div>
        `;
        return content;
    }


}
