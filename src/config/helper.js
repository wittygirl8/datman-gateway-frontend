const  decodeHtml =(html)=> {
    let txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

module.exports = { decodeHtml }
