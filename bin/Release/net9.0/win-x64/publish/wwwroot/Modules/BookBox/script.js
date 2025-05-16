class BookBox {
    constructor(id=null, apiRtInk_MSAP, idx, name, author, year, tableOfContents) {
        if(id != null) this.Id = (id.length > 0) ? id : this.constructor.name;
        this.UrlContent = `/Modules/${this.constructor.name}/content`; // Используем шаблонные строки
        this._LogBase = `Page component: ${this.constructor.name}. id: ${this.Id}`; // Шаблонные строки
        this._IsDebug = document.URL.includes("localhost"); // Присваиваем сразу
        if (this._IsDebug) console.log(`${this._LogBase} Ready to use`); // Логирование с шаблонной строкой
        this._ApiRtInk_MSAP = apiRtInk_MSAP
        this._Id = idx
        this._Name = name
        this._Author = author
        this._Year = year
        this._TableOfContents = tableOfContents
    }

    push(target, position = "afterend") {
        if(this._IsDebug) console.log(`${this._LogBase}.push()`);
        if (!(target instanceof HTMLElement)) target = document.getElementById(target);
        target.insertAdjacentHTML(position, this._html());

        document.querySelector("#" + this.Id + " button").addEventListener("click", async () => {
            var ok = await this._ApiRtInk_MSAP.DeleteBook(this._Id)
            if(ok) window.location.href = "/books"
        })
    }

    _html() {
        if (this._IsDebug) console.log(`${this._LogBase}._html()`);
        const idAttr = this.Id ? `id="${this.Id}"` : "";

        let olhtml = ""

        if(this._TableOfContents && this._TableOfContents.length > 0) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(this._TableOfContents, "text/xml");
            const chapters = xmlDoc.getElementsByTagName("chapter");

            olhtml = '<ol class="toc">';
            for (let chapter of chapters) {
                const num = chapter.getAttribute("num");
                const title = chapter.textContent;
                olhtml += `<li><strong>${num}.</strong> ${title}</li>`;
            }
            olhtml += '</ol>';

            olhtml = "<h2>Оглавлениие</h2>" + olhtml
        }

        return `
<div ${idAttr} class="${this.constructor.name}">
    <h1>${this._Name}</h1>
    <p><span>Author:</span><span>${this._Author}</span></p>
    <p><span>Year:</span><span>${this._Year}</span></p>
    ${olhtml}
    <a href="/book-edit/${this._Id}">EDIT BOOK</a>
    <button>DELETE BOOK</button>
</div>`;
    }
}