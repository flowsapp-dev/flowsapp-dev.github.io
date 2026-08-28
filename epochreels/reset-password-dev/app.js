(() => {
    "use strict";

    const endpoint = "https://7bw6pqii2jbbqvhefw4y3vudfm0bwwfd.lambda-url.eu-north-1.on.aws/";
    const minimumPasswordLength = 6;
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token") || "";

    const form = document.getElementById("reset-form");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const submitButton = document.getElementById("submit-button");
    const linkError = document.getElementById("link-error");
    const formMessage = document.getElementById("form-message");
    const successPanel = document.getElementById("success-panel");

    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
        linkError.hidden = false;
        form.hidden = true;
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        HideMessage();

        const password = passwordInput.value;
        const confirmation = confirmPasswordInput.value;

        if (password.length < minimumPasswordLength) {
            ShowMessage("Password must contain at least 6 characters.");
            passwordInput.focus();
            return;
        }

        if (password !== confirmation) {
            ShowMessage("Passwords do not match.");
            confirmPasswordInput.focus();
            return;
        }

        SetSubmitting(true);

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token, password }),
                cache: "no-store",
                credentials: "omit",
                referrerPolicy: "no-referrer"
            });

            const result = await ReadResult(response);

            if (response.ok && result.ok === true) {
                form.hidden = true;
                successPanel.hidden = false;
                return;
            }

            ShowMessage(MessageForCode(result.code));
        } catch {
            ShowMessage("Could not update your password. Check your connection and try again.");
        } finally {
            SetSubmitting(false);
        }
    });

    async function ReadResult(response) {
        try {
            return await response.json();
        } catch {
            return {};
        }
    }

    function MessageForCode(code) {
        switch (code) {
            case "INVALID_OR_EXPIRED_TOKEN":
                return "This password reset link is invalid or has expired. Request a new link from the game.";
            case "INVALID_PASSWORD":
            case "WEAK_PASSWORD":
                return "This password is not accepted. Choose a different password and try again.";
            case "RATE_LIMITED":
                return "Too many attempts. Wait a moment and try again.";
            default:
                return "Could not update your password. Please try again.";
        }
    }

    function SetSubmitting(isSubmitting) {
        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting ? "Updating..." : "Update password";
    }

    function ShowMessage(message) {
        formMessage.textContent = message;
        formMessage.hidden = false;
    }

    function HideMessage() {
        formMessage.textContent = "";
        formMessage.hidden = true;
    }
})();
