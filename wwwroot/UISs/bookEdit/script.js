export async function bookEditUIS() {
    // Добавляем скрипты и стили CodeMirror динамически
    const loadCodeMirror = () => {
        return new Promise((resolve) => {
            // Проверяем, не загружены ли уже скрипты
            if (window.CodeMirror) {
                resolve();
                return;
            }

            // Создаем массив с ресурсами для загрузки
            const resources = [
                { type: 'css', url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css' },
                { type: 'css', url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/dracula.min.css' },
                { type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js' },
                { type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/xml/xml.min.js' },
                { type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closetag.min.js' }
            ];

            let loaded = 0;
            
            resources.forEach(resource => {
                const element = resource.type === 'css' 
                    ? document.createElement('link')
                    : document.createElement('script');
                
                if (resource.type === 'css') {
                    element.rel = 'stylesheet';
                    element.href = resource.url;
                } else {
                    element.src = resource.url;
                }
                
                element.onload = () => {
                    loaded++;
                    if (loaded === resources.length) {
                        resolve();
                    }
                };
                
                document.head.appendChild(element);
            });
        });
    };

    const isDebug = document.URL.includes("localhost");
    if(isDebug) console.log("Is DEBUG");

    const urlSrplit = document.URL.split('/');
    let id = 0;
    if (urlSrplit.length > 4) id = parseInt(urlSrplit[4]);

    let headerBox = new HeaderBox("");
    headerBox.initial_title("4A");
    headerBox.push(document.getElementsByTagName("body")[0], "afterbegin");
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/resume-icon", alt: "resume icon", url: "https://git.rt.ink/resume.pdf" });
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/telegram-icon", alt: "email icon", url: "https://t.me/gitrtink_bot" });
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/email-icon-64", alt: "email icon", url: "mailto:rtink.git@gmail.com" });

    let lastVerticalId = headerBox.Id;

    document.getElementById(lastVerticalId).insertAdjacentHTML("afterend", "<main></main>");

    const apiRtInk_MSAP = new ApiRtInk_MSAP();

    if(id > 0) {
        const bookM = await apiRtInk_MSAP.GetBook(id);

        if(bookM != null) {
            // Ждем загрузки CodeMirror перед созданием BookEditBox
            await loadCodeMirror();
            
            let bookEditBox = new BookEditBox("", apiRtInk_MSAP, bookM.ID, bookM.Namee, bookM.Author, bookM.Yearr, bookM.TableOfContents);
            bookEditBox.push(document.getElementsByTagName("main")[0], "afterbegin");
            lastVerticalId = bookEditBox.Id;
        }
    }
    else {
        await loadCodeMirror();
        let bookEditBox = new BookEditBox("", apiRtInk_MSAP, 0, "", "", 0, "");
        bookEditBox.push(document.getElementsByTagName("main")[0], "afterbegin");
        lastVerticalId = bookEditBox.Id;
    }

    let buttonBox = new ButtonBox("", id>0 ? "BACK TO BOOK" : "BOOKS", id>0 ? "/book/" + id : "/books");
    buttonBox.push(lastVerticalId);
    lastVerticalId = buttonBox.Id;
}