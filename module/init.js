
Hooks.once("init", () => {
    // CONFIG.debug.hooks = true;

});

Hooks.once("ready", () => {
    let sidebar = $("#sidebar");
    sidebar.addClass("ccf");

    $("#chat-message").attr("placeholder", game.i18n.localize("CCFOLIA.ChatGuide"));

    $("#ui-top").append(`<div id="ccf-header" class="flexrow"></div>`);
    $("#ui-top #ccf-header").append($("#navigation"));
    $("#ui-top #ccf-header").append($("#controls"));

    $("#ui-bottom div").first().prepend($("#players"));
    $("#ui-left").remove();

    $("#ui-bottom").before(`<div id="ccf-tokens"></div>`);
    renderTokenViewer();


    // let chatControls = document.getElementById("chat-controls");
    // let controlButtons = chatControls.getElementsByClassName("control-buttons")[0];
    // controlButtons.style["flex-basis"] = "100%";
    // controlButtons.style["display"] = "flex";
    // controlButtons.style["justify-content"] = "space-between";

    // let diceList = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

    // for (let dice of diceList) {
    //     let diceButton = document.createElement("a");
    //     diceButton.className = `add-dice-to-chat ${dice}`;
    //     diceButton.setAttribute("aria-label", dice);
    //     diceButton.setAttribute("roll", "button");
    //     diceButton.setAttribute("aria-label", dice);
    //     controlButtons.prepend(diceButton);
    // }

    // let diceButton = document.createElement("a");
    // diceButton.className = `add-dice-to-chat ${diceDoms[1]}`;
    // controlButtons.prepend(diceButton);

    // controlButtons.prepend(`
    //     <a role="button" class="add-dice-to-chat ${diceDoms[1]}" style=""></a>
    // `);

});

Hooks.on("renderSceneControls", (control, html, data) => {
    html.attr("data-tooltip-direction", "DOWN");

    html.addClass("flexcol");
    html.find(".main-controls").addClass("flexrow");
    html.find(".sub-controls").addClass("flexrow");

    html.removeClass("flexrow");
    html.find(".main-controls").removeClass("flexcol");
    html.find(".sub-controls").removeClass("flexcol");
});

Hooks.on("createChatMessage", (message, options, id) => {
    let portrait = message.user.avatar; // "ui/denim-dark-090.png";
    if (message.speaker.token != null) {
        let token = game.scenes.active.tokens.get(message.speaker.token);
        portrait = token.texture.src;
    } else if (message.speaker.actor != null) {
        let actor = game.actors.get(message.speaker.actor);
        portrait = actor.img;
    }
    message.setFlag("ccfolia-style-ui", "portrait", portrait);
});

Hooks.on("renderChatMessage", (message, html, data) => {
    let portrait = message.user.avatar;
    if (message.getFlag("ccfolia-style-ui", "portrait") != null)
        portrait = message.getFlag("ccfolia-style-ui", "portrait");

    html.css("display", "flex");
    html.children().wrapAll(`<div class="ccf-content"></div>`);
    html.prepend(`<img class="ccf-portrait" src=${portrait} width=40 height=40>`);
    html.children().wrapAll(`<div class="ccf-style"></div>`);
    html.append(`<hr>`);
});

Hooks.on("renderTokenConfig", (tokenConfig, html, options) => {
    html.find("nav.sheet-tabs.tabs").first().append(`<a class="item" data-tab="ccf-token-status"><i class="fas fa-user-plus"></i>${game.i18n.localize("CCFOLIA.AddTokenToScene")}</a>`)
    html.find("footer.sheet-footer.flexrow").before(`<div class="tab" data-group="main" data-tab="ccf-token-status"></div>`);

    let tokenStatus = tokenConfig.object.getFlag("ccfolia-style-ui", "status");
    if (tokenStatus == null) {
        tokenStatus = {
            check: false,
            init: "",
            status: []
        }
        tokenConfig.object.setFlag("ccfolia-style-ui", "status", tokenStatus);
    }

    let tab = html.find('.tab[data-tab="ccf-token-status"]');
    tab.append(`
        <div class="form-group">
            <label>${game.i18n.localize("CCFOLIA.AddTokenToSceneDisplay")}</label>
            <input type="checkbox" name="ccf-showActor" ${tokenStatus.check ? "checked" : ""}/>
        </div>

        <div class="form-group">
            <label>${game.i18n.localize("CCFOLIA.Init")}</label>
            <input type="text" name="ccf-init" placeholder="${game.i18n.localize("CCFOLIA.Init")}" value="${tokenStatus.init}" data-dtype="String"/>
        </div>
    `);

    const attributeSource = tokenConfig.actor?.system instanceof foundry.abstract.DataModel
      ? tokenConfig.actor?.type
      : tokenConfig.actor?.system;
    const attributes = TokenDocument.implementation.getTrackedAttributes(attributeSource);

    let renderStatusTab = (statusList) => {
        $(".ccf-status").remove();
        tab.append(`
            <header class="ccf-status">
                <div class="flexrow">
                    <div class="ccf-label">${game.i18n.localize("CCFOLIA.Label")}</div>
                    <div class="ccf-check">${game.i18n.localize("CCFOLIA.isValue")}</div>
                    <div class="ccf-value">${game.i18n.localize("CCFOLIA.Value")} / ${game.i18n.localize("CCFOLIA.Max")}</div>
                    <div class="ccf-controls">
                        <a class="action-button" data-action="addStatus" data-tooltip="${game.i18n.localize("CCFOLIA.AddStatus")}">
                            <i class="fa-solid fa-plus"></i>
                        </a>
                    </div>
                </div>
            </header>    
        `);

        for (const [idx, status] of statusList.entries()) {
            let minContent = `<input type="text" name="ccfStatus.${idx}.min" value="${status.min}" data-dtype="String"/>`;
            if (!status.isValueMin) {
                minContent = `<select name="ccfStatus.${idx}.min">`;
                for (let [label, attrs] of Object.entries(attributes)) {
                    for (let attr of attrs) {
                        attr = attr.join(".");
                        let selected = (attr == status.min) ? "selected" : "";
                        if (label == "bar") {
                            selected = (attr + ".value" == status.min) ? "selected" : "";
                            minContent += `<option value="${attr}.value" ${selected}>${attr}.value</option>`;
                            selected = (attr + ".max" == status.min) ? "selected" : "";
                            minContent += `<option value="${attr}.max" ${selected}>${attr}.max</option>`;
                        } else
                            minContent += `<option value="${attr}" ${selected}>${attr}</option>`;
                    }
                }
                minContent += `</select>`
            }
        
            let maxContent = `<input type="text" name="ccfStatus.${idx}.max" value="${status.max}" data-dtype="String"/>`;
            if (!status.isValueMax) {
                maxContent = `<select name="ccfStatus.${idx}.max">`;
                for (let [label, attrs] of Object.entries(attributes)) {
                    for (let attr of attrs) {
                        attr = attr.join(".");
                        let selected = (attr == status.max) ? "selected" : "";
                        if (label == "bar") {
                            selected = (attr + ".value" == status.max) ? "selected" : "";
                            maxContent += `<option value="${attr}.value" ${selected}>${attr}.value</option>`;
                            selected = (attr + ".max" == status.max) ? "selected" : "";
                            maxContent += `<option value="${attr}.max" ${selected}>${attr}.max</option>`;
                        } else
                            maxContent += `<option value="${attr}" ${selected}>${attr}</option>`;
                    }
                }
                maxContent += `</select>`
            }
        
            tab.append(`
                <fieldset class="ccf-status" data-index="${idx}">
                    <div class="flexrow">
                        <div class="ccf-label">
                            <input type="text" name="ccfStatus.${idx}.label" value="${status.label}" data-dtype="String"/>
                        </div>
                        <div class="ccf-check" data-check="min">
                            <input name="ccfStatus.${idx}.isValueMin" type="checkbox" ${status.isValueMin ? "checked" : ""}/>
                        </div>
                        <div class="ccf-value">
                            ${minContent}
                        </div>
                        <div class="ccf-controls">
                            <a class="action-button" data-action="removeStatus" data-tooltip="${game.i18n.localize("CCFOLIA.RemoveStatus")}">
                                <i class="fa-solid fa-times"></i>
                            </a>
                        </div>
        
                    </div>
        
                    <div class="flexrow last-data">
                        <div class="ccf-check" data-check="max">
                            <input name="ccfStatus.${idx}.isValueMax" type="checkbox" ${status.isValueMax ? "checked" : ""}/>
                        </div>
                        <div class="ccf-value">
                            ${maxContent}
                        </div>
                        <div class="ccf-controls"></div>
                    </div>
        
                </fieldset>
            `);
        }

        tab.find(".action-button").click((event) => {
            event.preventDefault();
            const button = event.currentTarget;
            const action = button.dataset.action;
            game.tooltip.deactivate();
        
            // Get pending changes to modes
            const status = Object.values(foundry.utils.expandObject(tokenConfig._getSubmitData())?.ccfStatus || {});
    
            // Manipulate the array
            switch ( action ) {
                case "addStatus":
                    status.push({label: "", isValueMin: true, min: "", isValueMax: true, max: "" });
                    break;
                case "removeStatus":
                    const idx = button.closest(".ccf-status").dataset.index;
                    status.splice(idx, 1);
                    break;
            }
            renderStatusTab(status);
            html.css("height", "auto");
        });
    
        tab.find(".ccf-check").click((event) => {
            event.preventDefault();
            const button = event.currentTarget;
            const check = button.dataset.check;
            const idx = button.closest(".ccf-status").dataset.index;

            const status = Object.values(foundry.utils.expandObject(tokenConfig._getSubmitData())?.ccfStatus || {});
            status[idx][check] = "";

            renderStatusTab(status);
        });
    }

    renderStatusTab(tokenStatus.status);
    html.find("button[type=submit]").click(() => {
        const submitData = tokenConfig._getSubmitData();
        const status = Object.values(foundry.utils.expandObject(submitData)?.ccfStatus || {});
        tokenConfig.object.setFlag("ccfolia-style-ui", "status", {
            check: submitData["ccf-showActor"],
            init: submitData["ccf-init"],
            status: status
        });
    });
});


Hooks.on("createToken", () => renderTokenViewer());
Hooks.on("updateToken", () => renderTokenViewer());
Hooks.on("deleteToken", () => renderTokenViewer());

Hooks.on("updateActor", () => renderTokenViewer());
Hooks.on("deleteActor", () => renderTokenViewer());
Hooks.on("canvasReady", () => renderTokenViewer());

function getData(token, value) {
    let val = $.isNumeric(value) ? Number(value) : foundry.utils.getProperty(token.actor.system, value);
    return (val != undefined) ? Number(val) : 0;
}

function renderTokenViewer() {
    let scene = game.scenes.current;
    if (scene == undefined)
        return;

    let statusList = [];
    for (let token of scene.tokens) {
        if (token.actor == null)
            continue;

        let status = duplicate(token.getFlag("ccfolia-style-ui", "status"));
        if (status != null && status.check) {
            status.init = (status.init == "") ? -999 : getData(token, status.init);
            status.token = token;
            statusList.push(status);
        }
    }
    statusList = statusList.sort((a, b) => b.init - a.init);
    
    $("#ccf-tokens").empty();
    let ccfTokensDom = $("#ccf-tokens");
    for (let status of statusList) {
        let initContent = (status.init === "" || status.init === -999) ? "" : `<div class="init">${status.init}</div>`;
        let statusContent = `<div class="status-list">`;
        for (let attr of status.status) {
            if (attr.label == "")
                continue;
            let val = getData(status.token, attr.min);
            let percent = 100;
            if (attr.max != "") {
                let max = getData(status.token, attr.max);
                percent = val / max * 100;
                val += "/" + max;
            }

            statusContent += `
                <div class="status">
                    <div class="attr">
                        <label>${attr.label}</label>
                        <span>${val}</span>
                    </div>
                    <div class="bar">
                        <div class="blank"></div>
                        <div class="fill" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }
        statusContent += `</div>`;

        ccfTokensDom.append(`
            <div class="token" data-id="${status.token.id}">
                <img class="portrait" src="${status.token.texture.src}" width=40 height=40>
                ${initContent}
                ${statusContent}
            </div>
        `);
    }

    ccfTokensDom.find(".portrait").click(event => {
        event.preventDefault();
        const id = event.currentTarget.closest(".token").dataset.id;
        const token = game.scenes.current.tokens.get(id);
    });

}


// Hooks.on("renderChatMessage", (app, html, data) => chatListeners(app, html, data));
// Hooks.on("renderChatPopout", (app, html, data) => chatListeners(app, html, data));

function chatListeners(app, html, data) {
    




}
