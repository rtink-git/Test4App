export async function booksUIS() {
    const isDebug = document.URL.includes("localhost")
    if(isDebug) console.log("Is DEBUG")

    let headerBox = new HeaderBox("")
    headerBox.initial_title("4A")
    headerBox.push(document.getElementsByTagName("body")[0], "afterbegin");
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/resume-icon", alt: "resume icon", url: "https://git.rt.ink/resume.pdf" });
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/telegram-icon", alt: "email icon", url: "https://t.me/gitrtink_bot" });
    headerBox.push_menu_btn({ icon: headerBox.UrlContent + "/email-icon-64", alt: "email icon", url: "mailto:rtink.git@gmail.com" });

    let lastVerticalId = headerBox.Id

    document.getElementById(lastVerticalId).insertAdjacentHTML("afterend", "<main></main>")

    const apiRtInk_MSAP = new ApiRtInk_MSAP()

    const l = await apiRtInk_MSAP.GetAllBooks()

    if(l && l.length > 0) {
        let booksBox = new BooksBox("")
        booksBox.push(document.getElementsByTagName("main")[0], "afterbegin");
        booksBox.append_list(l);
        lastVerticalId = booksBox.Id
    }

    let buttonBox = new ButtonBox("", "ADD NEW BOOK", "/book-edit")
    buttonBox.push(lastVerticalId);
    lastVerticalId = buttonBox.Id
}