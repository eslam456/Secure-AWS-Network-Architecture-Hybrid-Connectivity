document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Get UI elements
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const messageBox = document.getElementById('messageBox');

    // Reset previous messages
    messageBox.className = 'message-box';
    messageBox.textContent = '';

    // Set loading state
    submitBtn.disabled = true;
    spinner.style.display = 'block';
    btnText.textContent = 'Sending...';

    try {
        // Send request to CloudFront, which routes it to the ALB -> EC2 -> MySQL database
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (response.ok) {
            // Success
            messageBox.textContent = data.message || 'Thank you! Your message has been sent.';
            messageBox.classList.add('success');
            document.getElementById('contactForm').reset();
        } else {
            // Server-side error (e.g., 400, 500)
            messageBox.textContent = data.error || 'Something went wrong. Please try again.';
            messageBox.classList.add('error');
        }
    } catch (error) {
        // Network or parsing error
        console.error('Error:', error);
        messageBox.textContent = 'Network error. Please check your connection and try again.';
        messageBox.classList.add('error');
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = 'Send Message';
    }
});