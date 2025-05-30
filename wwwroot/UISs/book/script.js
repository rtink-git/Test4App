export async function bookUIS() {
    const isDebug = document.URL.includes("localhost")
    if(isDebug) console.log("Is DEBUG")

    const urlSrplit = document.URL.split('/')
    let id = 0
    if (urlSrplit.length > 4) id = parseInt(urlSrplit[4]);

    let headerBox = new HeaderBox("")
    headerBox.initial_title("4A")
    headerBox.push(document.getElementsByTagName("body")[0], "afterbegin");
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/resume-icon", alt: "resume icon", url: "https://git.rt.ink/resume.pdf" });
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/telegram-icon", alt: "email icon", url: "https://t.me/gitrtink_bot" });
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/email-icon-64", alt: "email icon", url: "mailto:rtink.git@gmail.com" });

    let lastVerticalId = headerBox.Id

    document.getElementById(lastVerticalId).insertAdjacentHTML("afterend", "<main></main>")

    const apiRtInk_MSAP = new ApiRtInk_MSAP()

    if(id > 0) {
        const bookM = await apiRtInk_MSAP.GetBook(id)

        if(bookM != null) {
            let bookBox = new BookBox("", apiRtInk_MSAP, bookM.ID, bookM.Namee, bookM.Author, bookM.Yearr, bookM.TableOfContents)
            bookBox.push(document.getElementsByTagName("main")[0], "afterbegin");
            lastVerticalId = bookBox.Id
        }
    }

    let buttonBox = new ButtonBox("", "ALL BOOKS", "/books")
    buttonBox.push(lastVerticalId);
    lastVerticalId = buttonBox.Id
}