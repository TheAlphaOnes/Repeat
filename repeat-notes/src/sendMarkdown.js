export async function sendMarkdown(md, title, noflash, noqna) {
    const formData = new FormData();
    formData.append('md', md);

    const queryParams = new URLSearchParams({
        title: title,
        noflash: noflash,
        noqna: noqna
    }).toString();

    const url = `https://repeat.pythonanywhere.com/api/upload-notes?${queryParams}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload notes');
        }

        const data = await response.json();
        console.log('Uploaded notes:', data);
    } catch (error) {
        console.error('Error uploading notes:', error);
    }
}
