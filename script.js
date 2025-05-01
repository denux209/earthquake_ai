const fileInput = document.getElementById('fileInput');
const fileDropArea = document.querySelector('.file-drop-area');
const fileLabel = document.querySelector('.file-label');
const fileMsg = document.querySelector('.file-msg');
const filenameDisplay = document.getElementById('filename');
const uploadButton = document.getElementById('uploadButton');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressArea = document.querySelector('.progress-area');
const messageArea = document.getElementById('messageArea');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewContainer = document.querySelector('.image-preview-container');

let selectedFile = null;

fileDropArea.addEventListener('click', (e) => {
    if (e.target === fileDropArea) {
        fileInput.click();
    }
});

fileInput.addEventListener('change', handleFileSelect);

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, unhighlight, false);
});

fileDropArea.addEventListener('drop', handleDrop, false);

uploadButton.addEventListener('click', uploadFile);


function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    if (e.dataTransfer.types.includes('Files')) {
        fileDropArea.classList.add('is-active');
    }
}

function unhighlight(e) {
    fileDropArea.classList.remove('is-active');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        fileInput.files = files;
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        const potentialFile = files[0];

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 10 * 1024 * 1024;

        if (!allowedTypes.includes(potentialFile.type)) {
            showMessage('error', 'Geçersiz dosya türü (Sadece JPG, PNG, GIF).');
            resetUploader();
            return;
        }

        if (potentialFile.size > maxSize) {
            showMessage('error', `Dosya boyutu çok büyük (Maks ${maxSize / 1024 / 1024}MB).`);
            resetUploader();
            return;
        }

        selectedFile = potentialFile;

        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            imagePreviewContainer.style.display = 'block';
            fileDropArea.classList.add('has-preview');
        }
        reader.onerror = function(e) {
             console.error("Dosya okuma hatası:", e);
             showMessage('error', 'Dosya önizlemesi oluşturulamadı.');
             resetUploader();
        }
        reader.readAsDataURL(selectedFile);

        filenameDisplay.textContent = selectedFile.name;
        uploadButton.disabled = false;
        progressArea.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        clearMessage();

    } else {
        if (selectedFile) {
             resetUploader();
        }
    }
}

async function uploadFile() {
    if (!selectedFile) {
        showMessage('error', 'Lütfen önce bir dosya seçin.');
        return;
    }

    uploadButton.disabled = true;
    progressArea.style.display = 'flex';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    clearMessage();
    showMessage('info', 'Dosya yükleniyor ve analiz ediliyor...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const response = await fetch('/process-file', {
            method: 'POST',
            body: formData,
        });

        progressBar.style.width = '50%';
        progressText.textContent = '50%';

        const data = await response.json();

        progressBar.style.width = '100%';
        progressText.textContent = '100%';

        if (response.ok) {
            const resultText = data.result ? data.result.trim() : 'Modelden anlamlı bir sonuç alınamadı.';
            showMessage('success', `<b>Analiz Sonucu:</b><pre>${resultText}</pre>`);
        } else {
            throw new Error(data.error || `Sunucu Hatası (${response.status}): ${response.statusText}`);
        }

    } catch (error) {
        console.error('Yükleme veya Analiz Hatası:', error);
        showMessage('error', `Bir hata oluştu: ${error.message}`);
        progressArea.style.display = 'none';
    } finally {
         uploadButton.disabled = false;
    }
}

function showMessage(type, message) {
    messageArea.innerHTML = message;
    messageArea.className = `message-area ${type}`;
}

function clearMessage() {
    messageArea.innerHTML = '';
    messageArea.className = 'message-area';
}

function resetUploader() {
    selectedFile = null;
    fileInput.value = '';
    filenameDisplay.textContent = '';
    uploadButton.disabled = true;
    progressArea.style.display = 'none';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    clearMessage();

    imagePreview.src = '#';
    imagePreview.style.display = 'none';
    imagePreviewContainer.style.display = 'none';
    fileDropArea.classList.remove('has-preview');
}