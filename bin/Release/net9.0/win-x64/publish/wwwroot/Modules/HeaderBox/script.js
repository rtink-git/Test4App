class HeaderBox {
    constructor(id=null) {
        if(id != null) this.Id = (id.length > 0) ? id : this.constructor.name;
        this.UrlContent = `/Modules/${this.constructor.name}/content`; // Используем шаблонные строки
        this._LogBase = `Page component: ${this.constructor.name}. id: ${this.Id}`; // Шаблонные строки
        this._IsDebug = document.URL.includes("localhost"); // Присваиваем сразу
        if (this._IsDebug) console.log(`${this._LogBase} Ready to use`); // Логирование с шаблонной строкой

        this.__Title = "";
    }

    initial_title(title="") { this.__Title = title; }

    push(target, position = "afterend") {
        if(this._IsDebug) console.log(`${this._LogBase}.push()`);
        if (!(target instanceof HTMLElement)) target = document.getElementById(target);
        target.insertAdjacentHTML(position, this._html());
    }

    _html() {
        if (this._IsDebug) console.log(`${this._LogBase}._html()`);
        const idH = this.Id ? `id="${this.Id}"` : "";

        return `
<header ${idH} class="${this.constructor.name}">
    <div>
        <a href="/">
            ${this.__Title}
        </a>
        <nav>
            <ul></ul>
        </nav>
    </div>
</header>`;
    }

    // menu buttons

    // { id: "", type: "simple", position: "beforeend", url:"", icon: "", alt: "", title: "" }


    push_menu_btn(model) {
        let position = "beforeend"
        if(model.position != undefined && model.position != null)
            position = model.position
        document.querySelector("#" + this.Id + " > div:first-child > nav > ul").insertAdjacentHTML(position, this._menu_li_html(model)) 
    }

    _menu_li_html(model) {
        if(this._IsDebug) console.log(this._LogBase + "._menu_li()")
        
        let tp = 0; if(tp == undefined || tp == null) tp = 0

        let html = ""

        if(model != undefined && model != null) {
            let idAttr = "";
            if (model.id != undefined && model.id != null && model.id.length > 0) idAttr = "id=\"" + model.id + "\""

            let type = "simple"; if (model.type != undefined && model.type != null && model.type.length > 0) type = model.type
            let typeAttr = "data-type=\"" + type + "\""

            let hrefAttr = ""; if (model.url != undefined && model.url != null && model.url.length > 0) hrefAttr = "href=\"" + model.url + "\""

            let title = ""; if (model.title != undefined && model.title != null && model.title.length > 0) title = model.title

            let icon = ""; if(model.icon != undefined && model.icon != null && model.icon.length > 0) icon = model.icon

            let altAttr = ""; if (model.alt != undefined && model.alt != null && model.alt.length > 0) altAttr = "alt=\"" + model.alt + "\""
            
            let span = ""; if(title.length > 0) span = "<span>" + title + "</span>"

            let picture = ""
            if(icon.length > 0)
                picture = "\
<picture>\
    <source srcset=\"" + icon + "-dark.png\" media=\"(prefers-color-scheme: dark)\">\
    <img src=\"" + icon + "-light.png\" " + altAttr + ">\
</picture>"

            let html_sub = ""
            html_sub = "\
<a " + hrefAttr + ">\
    <div>\
    " + span + "\
    " + picture + "\
    </div>\
</a>\
"

            html += "\
<li " + idAttr + " " + typeAttr + ">\
" + html_sub + "\
</li>"
        }

        return html;
    }

    // --------------------
}