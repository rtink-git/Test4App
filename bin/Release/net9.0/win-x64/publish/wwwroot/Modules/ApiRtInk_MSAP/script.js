// Api.rt.ink - microservice. Api provider
// --------------------

class ApiRtInk_MSAP {
    constructor() {
        this._LogBase = `Page component: ${this.constructor.name}.`
        try {
            this._IsDebug = document.URL.includes("://localhost");
            this._UrlApi = this._IsDebug ? "https://localhost:7112" : "https://api.rt.ink";
            this._AlgaSessionLS = "AlgaSession"
            if(this._IsDebug) console.debug(this._LogBase + " Ready to use")
        } catch (error) { console.error(this._LogBase, error); }
    }

    DeleteBook = (id) => this._R_DELETE("/WebAppA4/DeleteBook?id=" + id);
    InsertBook = (bookData) => this._R_POST_JSON("/WebAppA4/InsertBook", bookData);
    GetBook = (id) => this._RJ("/WebAppA4/GetBook?id=" + id);
    GetAllBooks = () => this._RJ("/WebAppA4/GetAllBooks");
    UpdateBook = (bookData) => this._R_POST_JSON("/WebAppA4/UpdateBook", bookData);


    _RJ_DELETE = urlPart => this._RJ(urlPart, true, 0, "DELETE");
    _RJ_POST = urlPart => this._RJ(urlPart, true, 0, "POST");

    async _RJ(urlPart, isAuh = false, cacheInSec=0, method = "GET") {
        const nm = this._LogBase + "_RJ()";
        try {
            const response = await this._R(urlPart, isAuh, cacheInSec, method)
            if (response?.ok && response.status === 200) {
                var json = await response.json();
                
                if(this._IsDebug) console.debug(nm, json)
                
                return json
            }
        } catch (error) { console.error(nm + " " + urlPart, error); }
        return null
    }

    _R_DELETE = urlPart => this._R(urlPart, true, 0, "DELETE");
    _R_POST = urlPart => this._R(urlPart, true, 0, "POST");

    _R_POST_JSON = async (urlPart, data) => {
        const nm = this._LogBase + "_R_POST_JSON()";
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            const s = this._GetSession();
            if (s) headers[this._AlgaSessionLS] = s;

            const response = await fetch(this._UrlApi + urlPart, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            // Для InsertBook: успешный ответ содержит Id
            // Для UpdateBook: успешный ответ может быть пустым или содержать success
            if (response.ok) {
                return responseData;
            }

            throw new Error(responseData.message || `Request failed with status ${response.status}`);

        } catch (error) {
            console.error(`${nm} ${urlPart}`, error);
            throw error;
        }
    }

    async _R(urlPart, isAuh = false, cacheInSec = 0, method = "GET", headers = { }) {
        const nm = this._LogBase + "_R()";

        try {
            if(cacheInSec > 0) headers['Cache-Control'] = `public, max-age=${cacheInSec}`;
            
            if(isAuh) {
                var s = this._GetSession();
                if(s) headers[this._AlgaSessionLS] = s;
            }

            const response = await fetch(this._UrlApi + urlPart, { method, headers });
            if (response?.ok && response.status === 200) {
                if(this._IsDebug) console.debug(`${nm} ${urlPart}. Method: ${method}. Response status: ${response.status}`)
                return response;
            }
            else {
                var responseText = await response.text()
                console.error(`${nm} ${urlPart}. Method: ${method}. Response status: ${response.status}. Error text: ${responseText}`);
            }
        } catch (error) { console.error(`${nm} ${urlPart}. Method: ${method}`); }

        return null
    }

    _GetSession = () => localStorage.getItem(this._AlgaSessionLS)
}

// Lines now: 2025-04-26: 133 135 / 115 - Before