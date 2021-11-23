// ==UserScript==
// @name        Nachrichtenvorschau
// @version     1.1.0
// @author      holzmaster
// @namespace   holzmaster
// @include     https://pr0gramm.com*
// @updateURL   https://holzmaster.github.io/message-preview/message-preview.user.js
// @downloadURL https://holzmaster.github.io/message-preview/message-preview.user.js
// @icon        https://pr0gramm.com/media/pr0gramm-favicon.png
// @grant       none
// ==/UserScript==

(() => {
	addGlobalStyle(`
	.pending-popover {
		position: absolute;
		top: 52px;
		right: 0;
		min-width: 30vw;
		z-index: 9001;
		padding: 20px;

		color: #fff;
		background-color: black;
		filter: drop-shadow(0 20px 30px #000);

		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	.pending-popover h4 {
		margin: 0;
	}
	.pending-popover .message-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.pending-popover .message-container .message-user {
		font-size: 80%;
		color: var(--theme-secondary-color);
	}
	`);

	addScript(`
	const $$ = document.getElementById.bind(document);
	const $ = document.querySelector.bind(document);
	const createElement = (element, className = undefined, textContent = undefined) => {
		const res = document.createElement(element);

		if (typeof className !== "undefined")
			res.className = className;

		if (typeof textContent !== "undefined")
			res.textContent = textContent;
		return res;
	}

	let popover = null;

	function installHover() {
		console.assert(!popover);

		const ib = $$("inbox-link");
		ib.style.position = "relative";

		popover = createElement("div", "pending-popover", "Lade...");

		ib.appendChild(popover);

		popover.style.display = "none";
		ib.addEventListener("mouseenter", () => {
			popover.style.display = "";
			updatePopoverContents();

		});
		ib.addEventListener("mouseleave", () => {
			popover.style.display = "none";
		});
	}

	async function updatePopoverContents() {
		popover.innerHTML = "";
		popover.textContent = "Lade..."

		const inboxData = await fetch("/api/inbox/pending").then(r => r.json());
		if (!inboxData || !inboxData.messages) {
			popover.textContent = "Fehler beim Laden :(";
			return;
		}
		const messages = inboxData.messages;

		if (messages.length === 0) {
			popover.textContent = "Keine Nachrichten";
			return;
		}
		popover.textContent = "";

		const counter = createElement("h4", undefined, \`\${messages.length} Nachrichten\`);

		const messageContainer = createElement("div", "message-container");

		messages.map(createInboxElement).forEach(e => messageContainer.appendChild(e));

		popover.appendChild(counter);
		popover.appendChild(messageContainer);
	}

	function createInboxElement(message) {
		const container = createElement("div", "inbox-element");

		container.appendChild(
			createElement("div", "message-user", message.name),
		);
		container.appendChild(
			createElement("div", "message-content", message.message),
		);

		return container;
	}

	setTimeout(() => installHover(), 100);
	`
	);

	function addGlobalStyle(css) {
		const style = document.createElement("style");
		style.innerHTML = css;
		document.head.appendChild(style);
	}

	function addScript(code) {
		const script = document.createElement("script");
		script.type = "module";
		style.innerHTML = css;
		document.body.appendChild(script);
	}
})();
