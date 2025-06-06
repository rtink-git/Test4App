class BooksBox {
    constructor(id=null) {
        if(id != null) this.Id = (id.length > 0) ? id : this.constructor.name;
        this.UrlContent = `/Modules/${this.constructor.name}/content`; // Используем шаблонные строки
        this._LogBase = `Page component: ${this.constructor.name}. id: ${this.Id}`; // Шаблонные строки
        this._IsDebug = document.URL.includes("localhost"); // Присваиваем сразу
        if (this._IsDebug) console.log(`${this._LogBase} Ready to use`); // Логирование с шаблонной строкой
    }

    push(target, position = "afterend") {
        if(this._IsDebug) console.log(`${this._LogBase}.push()`);
        if (!(target instanceof HTMLElement)) target = document.getElementById(target);
        target.insertAdjacentHTML(position, this._html());
    }

    append_list(list) {
        const nm = `${this._LogBase}append_list()`;
        try {
            if (!list?.length) return;
        
            const ulElement = document.getElementById(this.Id)?.querySelector("ul");
            if (!ulElement) return;
        
            for (const model of list) {
                ulElement.insertAdjacentHTML("afterbegin", this._li(model));
            }

            if(this._IsDebug) console.debug(nm)
        } catch (error) { console.error(nm, error); }
    }

    _html() {
        if (this._IsDebug) console.log(`${this._LogBase}._html()`);
        const idAttr = this.Id ? `id="${this.Id}"` : "";

        const email = "rtink.git@gmail.com"

        return `
<div ${idAttr} class="${this.constructor.name}">
    <h1>
        Books
    </h1>
    <p>
        Список татарской литературы обязательной для прочтения
    </p>
    <ul>
    </ul>
</div>`;
    }

    _li(model) {
        const nm = `${this._LogBase}_li()`;
        try {
            if (!model) return "";

            return `
<li>
    <a href="/book/${model.ID}">
        <h1>${model.Namee}</h1>
        <p><span>Author:</span><span>${model.Author}</span><span>Year:</span><span>${model.Yearr}</span></p>
    </a>
</li>`
        } catch (error) { console.error(nm, error); }
    }
}