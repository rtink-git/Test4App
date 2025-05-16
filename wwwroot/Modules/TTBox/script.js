class TTBox {
    constructor(id=null, title, task, slideUrl, attachedFile, answer) {
        if(id != null) this.Id = (id.length > 0) ? id : this.constructor.name;
        this.UrlContent = `/Modules/${this.constructor.name}/content`; // Используем шаблонные строки
        this._LogBase = `Page component: ${this.constructor.name}. id: ${this.Id}`; // Шаблонные строки
        this._IsDebug = document.URL.includes("localhost"); // Присваиваем сразу
        if (this._IsDebug) console.log(`${this._LogBase} Ready to use`); // Логирование с шаблонной строкой
        this._Title = title
        this._Task = task
        this._SlideUrl = slideUrl ? slideUrl : null
        this._AttachedFile = attachedFile ? attachedFile : null
        this._Answer = answer ? answer : null
    }

    push(target, position = "afterend") {
        if(this._IsDebug) console.log(`${this._LogBase}.push()`);
        if (!(target instanceof HTMLElement)) target = document.getElementById(target);
        target.insertAdjacentHTML(position, this._html());
    }

    _html() {
        if (this._IsDebug) console.log(`${this._LogBase}._html()`);
        const idAttr = this.Id ? `id="${this.Id}"` : "";

        var answerHtml = this._Answer ? `<p>${this._Answer}</p>` : ""
        var imgHtml = this._SlideUrl ? `<img src="${this._SlideUrl}" />` : ""
        var attachedFileHtml = this._AttachedFile ?  `<a href="${this._AttachedFile}" target="_blank">Attached file</a>` : ""

        return `
<div ${idAttr} class="${this.constructor.name}">
    <h1>${this._Title}</h1>
    <p>
        ${this._Task}
    </p>
    <h2>SOLVING</h2>
    ${imgHtml}
    ${attachedFileHtml}
    ${answerHtml}
</div>`;
    }
}