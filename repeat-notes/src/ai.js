export async function fetchAI(notes, question, editor) {
    const formData = new FormData();
    formData.append('notes', notes);
    formData.append('question', question);

    try {
        const response = await fetch('https://repeat.pythonanywhere.com/api/ai', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to fetch AI response');
        }

        const data = await response.json();
        editor.commands.insertContentAt(12, data.rsp, {
            updateSelection: true,
            parseOptions: {
                preserveWhitespace: 'full',
            }
        })
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return null;
    }
}
