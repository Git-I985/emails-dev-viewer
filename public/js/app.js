const app = Vue.createApp({
    data() {
        return {
            page: null,
            fetchingEmails: false,
            lang: localStorage.getItem('selectedLang') || 'en',
            subject: null,
            langs: [],
            pages: [],
            resolutions: [661, 480, 380],
            copied: false,
            filters: {
                "all": () => true
            },
            selectedFilter: "all",
            stickyControlPanel: JSON.parse(localStorage.getItem('stickyControlPanel')) || false
        }
    },
    created() {
        this.fetchEmails();
        window.addEventListener("keydown", (e) => {
            const { key } = e;

            if (document.activeElement.classList.contains("form-select") || !["ArrowUp", "ArrowDown"].includes(key)) {
                return false;
            }

            e.preventDefault();

            const pages = this.pages.filter(this.filters[this.selectedFilter]);
            const currentPageIndex = pages.indexOf(this.page);
            const newPageIndex = key === "ArrowUp" ? currentPageIndex - 1 : currentPageIndex + 1;
            if (newPageIndex >= 0 && newPageIndex < pages.length) {
                this.page = pages[newPageIndex];
            }
        });
    },
    beforeUpdate() {
        this.updateTitle()
        this.updateSubject()
        this.updateIframeHeight()
        this.copied = false
    },
    computed: {
        filteredPages() {
            return this.pages.filter(this.filters[this.selectedFilter])
        },
    },
    watch: {
        selectedFilter(newFilter) {
            localStorage.setItem('selectedFilter', newFilter)
            this.page = this.pages.filter(this.filters[this.selectedFilter]).shift()
        },
        stickyControlPanel(value) {
            localStorage.setItem('stickyControlPanel', value)
        },
        page(newPage) {
            localStorage.setItem('selectedPage', newPage)
        },
        lang(newLang) {
            localStorage.setItem('selectedLang', newLang)
        }
    },
    methods: {
        getUrl(type) {
            return {
                template: `./${this.lang}/${this.page}.html`,
                subject: `./${this.lang}/${this.page}_subject.html`
            }[type];
        },
        updateTitle() {
            const text = this.langs[this.lang] + ' - ' + this.page;
            document.querySelector('title').innerText = text
        },
        copyEmailHtmlToClipboard() {
            const iframe = document.querySelector('iframe.preview-iframe')
            const content = iframe.contentWindow.document.documentElement.innerHTML
            return navigator.clipboard.writeText(content)
                .then(() => this.copied = true)
        },
        goToPostdrop(e) {
            e.preventDefault();
            this.copyEmailHtmlToClipboard()
                .then(() => window.open(e.target.dataset.href));
        },
        openEmailInNewTab({target}) {
            window.open(target.dataset.href);
        },
        updateSubject() {
            fetch(this.getUrl('subject'))
                .then(response => response.arrayBuffer())
                .then(buffer => new TextDecoder("utf-16be").decode(buffer))
                .then((subject) => {
                    this.subject = subject
                })
        },
        updateIframeHeight() {
            document.querySelectorAll('iframe')
                .forEach((iframe) => {
                    iframe.onload = function () {
                        this.classList.remove('loading');
                        this.style.height = this.contentDocument.body.scrollHeight + 'px';
                    }
                })
        },
        fetchEmails() {
            this.fetchingEmails = true
            return fetch('/emails')
                .then(emails => emails.json())
                .then(emails => {
                    this.langs = emails.langs
                    this.pages = emails.pages
                    this.page = localStorage.getItem('selectedPage') || this.pages[0]

                    this.filters = {
                        "all": () => true,
                        "marketing": (pageName) => pageName.includes(emails.project === 'PRIME' ? 'did-you-know' : 'marketing'),
                        "service": (pageName) => !this.filters.marketing(pageName)
                    }

                    this.selectedFilter = localStorage.getItem('selectedFilter') || Object.keys(this.filters).shift()

                    const self = this
                    setTimeout(() => {
                        self.fetchingEmails = false
                    }, 1000)

                })
        }
    }
})

app.mount('#app');
