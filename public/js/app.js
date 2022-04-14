const app = Vue.createApp({
    data() {
        return {
            page: null,
            fetchingEmails: false,
            lang: localStorage.getItem('selectedLang') || 'en',
            subject: null,
            langs: [],
            pages: [],
            defaultResolutions: [660, 480, 380],
            copied: false,
            filters: {
                all: () => true,
            },
            selectedFilter: 'all',
            stickyControlPanel: JSON.parse(localStorage.getItem('stickyControlPanel')) || false,
            oneResolution: JSON.parse(localStorage.getItem('oneResolution')) || false,
            darkTheme: JSON.parse(localStorage.getItem('darkTheme')) || false,
            iframeLinks: [],
        };
    },
    created() {
        this.fetchEmails();
        window.addEventListener('keydown', (e) => {
            const { key } = e;
            // console.log(key);
            // console.log(Object.keys(this.langs).indexOf(this.lang));
            if (
                document.activeElement.classList.contains('form-select') ||
                !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)
            ) {
                return false;
            }

            e.preventDefault();

            if (['ArrowUp', 'ArrowDown'].includes(key)) {
                const pages = this.pages.filter(this.filters[this.selectedFilter]);
                const currentPageIndex = pages.indexOf(this.page);
                const newPageIndex = key === 'ArrowUp' ? currentPageIndex - 1 : currentPageIndex + 1;
                if (newPageIndex >= 0 && newPageIndex < pages.length) {
                    this.page = pages[newPageIndex];
                }
                return;
            }

            if (['ArrowLeft', 'ArrowRight'].includes(key)) {
                const currentLangIndex = Object.keys(this.langs).indexOf(this.lang);
                const newLangIndex = key === 'ArrowLeft' ? currentLangIndex - 1 : currentLangIndex + 1;
                if (newLangIndex >= 0 && newLangIndex < Object.keys(this.langs).length) {
                    this.lang = Object.keys(this.langs)[newLangIndex];
                }
            }
        });
    },
    beforeUpdate() {
        this.updateTitle();
        this.updateSubject();
        document.documentElement.className = this.darkTheme ? 'darkTheme' : '';
        this.copied = false;
    },
    computed: {
        filteredPages() {
            return this.pages.filter(this.filters[this.selectedFilter]);
        },
        resolutions() {
            return this.oneResolution ? [this.defaultResolutions[0]] : this.defaultResolutions;
        },
    },
    watch: {
        selectedFilter(newFilter) {
            localStorage.setItem('selectedFilter', newFilter);
            const filter = this.filters[this.selectedFilter];
            const filtred = this.pages.filter(filter);
            this.page = filtred.includes(this.page) ? this.page : filtred.shift();
        },
        stickyControlPanel(value) {
            localStorage.setItem('stickyControlPanel', value);
        },
        page(newPage) {
            localStorage.setItem('selectedPage', newPage);
        },
        oneResolution(value) {
            localStorage.setItem('oneResolution', value);
        },
        darkTheme() {
            localStorage.setItem('darkTheme', this.darkTheme);
        },
    },
    methods: {
        getUrl(type) {
            const url = {
                template: `./${this.lang}/${this.page}.html`,
                subject: `./${this.lang}/${this.page}_subject.html`,
            }[type];
            return url
        },
        updateTitle() {
            const text = this.lang + ' - ' + this.page;
            document.querySelector('title').innerText = text;
        },
        copyEmailHtmlToClipboard() {
            const iframe = document.querySelector('iframe.preview-iframe');
            const content = iframe.contentWindow.document.documentElement.innerHTML;
            return navigator.clipboard.writeText(content).then(() => (this.copied = true));
        },
        goToPostdrop(e) {
            e.preventDefault();
            this.copyEmailHtmlToClipboard().then(() => window.open(e.target.dataset.href));
        },
        openEmailInNewTab({ target }) {
            window.open(target.dataset.href);
        },
        updateSubject() {
            fetch(this.getUrl('subject'))
                .then((response) => response.arrayBuffer())
                .then((buffer) => new TextDecoder('utf-16be').decode(buffer))
                .then((subject) => {
                    this.subject = subject;
                });
        },
        rerenderEmails() {
            // document.body.classList.add('loading');
            // const command = 'java -jar pebble.jar render src -';
            // fetch(`/execute/${encodeURIComponent(command)}`)
            //     .then((data) => {
            //         if (data.status === 200) {
            //             return this.fetchEmails();
            //         }
            //         alert('Ошибка обновления писем на сервере, проверьте логи или попытайтесь вручную');
            //     })
            //     .then(() => {
            //         document.body.classList.remove('loading');
            //     });
        },
        fetchEmails() {
            this.fetchingEmails = true;
            return fetch('./emails/')
                .then((emails) => emails.json())
                .then((emails) => {
                    this.langs = emails.langs;
                    this.pages = emails.pages;
                    this.page = localStorage.getItem('selectedPage') || this.pages[0];
                    this.filters = {
                        all: () => true,
                        marketing: (pageName) =>
                            pageName.includes(emails.project === 'PRIME' ? 'did-you-know' : 'marketing'),
                        service: (pageName) => !this.filters.marketing(pageName),
                    };
                    this.selectedFilter = localStorage.getItem('selectedFilter') || Object.keys(this.filters).shift();

                    document.querySelectorAll('iframe').forEach((iframe) => {
                        iframe.contentWindow.location.reload();
                    });

                    // const self = this;
                    // setTimeout(() => {
                    //     self.fetchingEmails = false;
                    // }, 1000);
                });
        },
    },
});

app.mount('#app');
