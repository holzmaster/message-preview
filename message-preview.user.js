// ==UserScript==
// @name        Nachrichtenvorschau
// @version     1.2.0
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
	.pending-popover .other-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.pending-popover .other-container .message-user {
		font-size: 80%;
		color: var(--theme-secondary-color);
	}
	.pending-popover .stalk-container {
		display: flex;
		flex-direction: row;
		gap: 1px;
	}
	.pending-popover .stalk-container img {
		width: 100px;
		height: 100px;
	}
	`);

	addScript(`(() => {
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


			const stalkMessages = messages.filter(m => m.type === "follows");
			if (stalkMessages.length > 0) {
				const counter = createElement("h4", undefined, stalkMessages.length + " Neue Posts");

				const messageContainer = createElement("div", "stalk-container");
				stalkMessages.map(createStalkMessageElement).forEach(e => messageContainer.appendChild(e));

				const stalkMessagesElement = createElement("div", "stalk-messages");

				stalkMessagesElement.appendChild(counter);
				stalkMessagesElement.appendChild(messageContainer);
				popover.appendChild(stalkMessagesElement);
			}

			const otherMessages = messages.filter(m => m.type !== "follows");
			if (otherMessages.length > 0) {
				const counter = createElement("h4", undefined, otherMessages.length + " Nachrichten");

				const messageContainer = createElement("div", "other-container");
				otherMessages.map(createOtherMessageElement).forEach(e => messageContainer.appendChild(e));

				const otherMessagesElement = createElement("div", "other-messages");

				otherMessagesElement.appendChild(counter);
				otherMessagesElement.appendChild(messageContainer);
				popover.appendChild(otherMessagesElement);
			}

		}

		function createOtherMessageElement(message) {
			const container = createElement("div");

			container.appendChild(createElement("div", "message-user", message.name));
			container.appendChild(createElement("div", "message-content", message.message));

			return container;
		}

		function createStalkMessageElement(message) {
			const container = createElement("div");

			const img = createElement("img", "stalk-content", message.message);
			img.src = "https://thumb.pr0gramm.com/" + message.thumb;
			container.appendChild(img);

			return container;
		}

		setTimeout(() => installHover(), 100);
	})();`);

	function addGlobalStyle(css) {
		const style = document.createElement("style");
		style.innerHTML = css;
		document.head.appendChild(style);
	}

	function addScript(code) {
		const script = document.createElement("script");
		script.type = "module";
		script.innerHTML = code;
		document.body.appendChild(script);
	}
})();
