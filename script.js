document.addEventListener('DOMContentLoaded', function() {
    const installButtons = document.querySelectorAll('.install-btn');
    const selectedList = document.getElementById('selected-list');
    const selectedCount = document.getElementById('selected-count');
    const downloadSelectedBtn = document.getElementById('download-selected');
    const selectedSoftware = new Map();

    // Ngăn chặn sự kiện click từ link tải xuống lan ra button
    document.querySelectorAll('.direct-download').forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // Handle button clicks
    installButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Không xử lý click nếu người dùng click vào link tải xuống
            if (e.target.classList.contains('direct-download')) {
                return;
            }

            const software = this.dataset.software;
            const downloadLink = this.querySelector('.direct-download').href;
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedSoftware.delete(software);
            } else {
                this.classList.add('selected');
                selectedSoftware.set(software, downloadLink);
            }

            updateSelectedList();
        });
    });

    // Update selected software list and count
    function updateSelectedList() {
        selectedList.innerHTML = '';
        selectedSoftware.forEach((url, name) => {
            const li = document.createElement('li');
            li.textContent = name;
            selectedList.appendChild(li);
        });

        const count = selectedSoftware.size;
        selectedCount.textContent = count;
        downloadSelectedBtn.disabled = count === 0;
    }

    // Handle bulk download
    downloadSelectedBtn.addEventListener('click', function() {
        if (selectedSoftware.size === 0) {
            alert('Vui lòng chọn ít nhất một phần mềm để tải xuống');
            return;
        }

        // Create a zip file containing all selected software
        const zip = new JSZip();
        
        // Add each selected software to the zip
        selectedSoftware.forEach((url, name) => {
            // Trong thực tế, bạn sẽ cần fetch file thực từ server
            zip.file(`${name}.exe`, `Download link for ${name}: ${url}`);
        });

        // Generate and download the zip file
        zip.generateAsync({type: "blob"})
        .then(function(content) {
            const zipUrl = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = 'selected-software.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(zipUrl);

            // Hỏi người dùng có muốn bỏ chọn tất cả không
            if (confirm('Tải xuống đã bắt đầu. Bạn có muốn bỏ chọn tất cả phần mềm?')) {
                selectedSoftware.clear();
                installButtons.forEach(btn => btn.classList.remove('selected'));
                updateSelectedList();
            }
        });
    });
});

//`````================================================== khác 
async function downloadFromDrive(fileId, filename) {
    const button = event.currentTarget;
    button.classList.add('loading');
    
    try {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Bạn cần thêm token của Google Drive API
            }
        });
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Không thể tải file. Vui lòng thử lại sau.');
    } finally {
        button.classList.remove('loading');
    }
}

async function downloadFile(url, filename) {
    const button = event.currentTarget;
    button.classList.add('loading');
    
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Không thể tải file. Vui lòng thử lại sau.');
    } finally {
        button.classList.remove('loading');
    }
}