class BookEditBox {
    constructor(id=null, apiRtInk_MSAP, idx, name, author, year, tableOfContents) {
        if(id != null) this.Id = (id.length > 0) ? id : this.constructor.name;
        this.UrlContent = `/Modules/${this.constructor.name}/content`;
        this._LogBase = `Page component: ${this.constructor.name}. id: ${this.Id}`;
        this._IsDebug = document.URL.includes("localhost");
        if (this._IsDebug) console.log(`${this._LogBase} Ready to use`);
        
        this._ApiRtInk_MSAP = apiRtInk_MSAP;
        this._Id = idx;
        this._Name = name;
        this._Author = author;
        this._Year = year;
        this._TableOfContents = tableOfContents || '<contents></contents>';
    }

    push(target, position = "afterend") {
        if(this._IsDebug) console.log(`${this._LogBase}.push()`);
        if (!(target instanceof HTMLElement)) target = document.getElementById(target);
        target.insertAdjacentHTML(position, this._html());

        // Инициализация редактора кода
        const editor = CodeMirror.fromTextArea(document.getElementById('tocEditor'), {
            mode: 'xml',
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 2,
            tabSize: 2,
            theme: 'default',
            autoCloseTags: true
        });

        // Обработчик submit формы
        document.querySelector(`#${this.Id} form`).addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            
            try {
                // Получаем и валидируем данные формы
                const title = form.querySelector("#bookName").value.trim();
                const author = form.querySelector("#bookAuthor").value.trim();
                const year = parseInt(form.querySelector("#bookYear").value, 10);
                const toc = editor.getValue();

                // Валидация
                if (!title) throw new Error("Please enter the book title");
                if (!author) throw new Error("Please enter the author name");
                if (isNaN(year) || year < 0) throw new Error("Please enter a valid publication year");
                
                // Валидация XML
                try {
                    this._validateXML(toc);
                } catch (xmlError) {
                    throw new Error(`Invalid table of contents: ${xmlError.message}`);
                }

                // Подготовка данных для отправки
                const bookData = {
                    ID: this._Id,
                    Name: title,
                    Author: author,
                    Year: year,
                    TableOfContents: toc
                };

                const isUpdate = this._Id > 0;
                const response = await (this._Id > 0 
                    ? this._ApiRtInk_MSAP.UpdateBook(bookData)
                    : this._ApiRtInk_MSAP.InsertBook(bookData));

                const newId = response.id;  // <-- маленькая буква!

                const isNew = !this._Id || this._Id === 0;

                if (isNew && newId) {
                    window.location.href = `/book/${newId}`;
                } else if (!isNew) {
                    window.location.href = `/book/${this._Id}`;
                } else {
                    alert("Не удалось получить ID новой книги");
                }
            } catch (error) {
                console.error("Book save error:", error);
                this._handleFormError(error, form, editor);
            }
        });
    }

    // Вспомогательный метод для обработки ошибок
    _handleFormError(error, form, editor) {
        let userMessage = error.message;
        
        // Специальные обработки ошибок
        if (error.message.includes("Resource not found")) {
            userMessage = "The book was not found. It may have been deleted.";
        } else if (error.message.includes("Database error")) {
            userMessage = "A database error occurred. Please try again later.";
        } else if (error.message.includes("Invalid XML format")) {
            userMessage = "Error in table of contents format. Please check XML syntax.";
        } else if (error.message.includes("HTTP error")) {
            userMessage = "Server communication error. Please try again.";
        }
        
        // Показываем ошибку пользователю
        alert(userMessage);
        
        // Фокусируемся на проблемном поле
        if (error.message.includes("title")) {
            form.querySelector("#bookName").focus();
        } else if (error.message.includes("author")) {
            form.querySelector("#bookAuthor").focus();
        } else if (error.message.includes("year")) {
            form.querySelector("#bookYear").focus();
        } else if (error.message.includes("table of contents")) {
            editor.focus();
        }
    }

    _validateXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Invalid XML format");
        }
        
        if (!xmlDoc.getElementsByTagName("contents").length) {
            throw new Error("Missing root contents element");
        }
    }

    _html() {
        if (this._IsDebug) console.log(`${this._LogBase}._html()`);
        const idAttr = this.Id ? `id="${this.Id}"` : "";

        let title = "ДОБАВИТЬ КНИГУ"
        if(this._Id > 0) title = "ИЗЕНИТЬ КНИГУ"

        return `
<div ${idAttr} class="${this.constructor.name}">
    <h1>${title}</h1>
    <form>
        <div class="form-group">
            <label for="bookName">Название книги:</label>
            <input type="text" id="bookName" value="${this._Name}" required>
        </div>
        
        <div class="form-group">
            <label for="bookAuthor">Автор:</label>
            <input type="text" id="bookAuthor" value="${this._Author}" required>
        </div>
        
        <div class="form-group">
            <label for="bookYear">Год издания:</label>
            <input type="number" id="bookYear" value="${this._Year}" required>
        </div>
        
        <div class="form-group">
            <h2>Оглавление (XML формат)</h2>
            <div class="editor-container">
                <textarea id="tocEditor">${this._escapeHtml(this._TableOfContents)}</textarea>
            </div>
            <div class="editor-hint">
                Пример формата:
                <pre>&lt;contents&gt;
  &lt;chapter num="1"&gt;Введение&lt;/chapter&gt;
  &lt;chapter num="2"&gt;Основная часть&lt;/chapter&gt;
&lt;/contents&gt;</pre>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="save-btn">Сохранить изменения</button>
        </div>
    </form>
</div>`;
    }

    _escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}