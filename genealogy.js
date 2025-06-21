document.addEventListener("DOMContentLoaded", function() {
    fetch('Daxcsa.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network error ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('JSON data loaded successfully:', data);
            // Validate the data structure
            validateData(data.data);
            data.data.attributes.forEach(item => {
                genealogyApp.setgenealogyData(item);
            });
            displaygenealogyData(16344);
        })
        .catch(error => {
            console.error(error);
            alert('Error loading JSON data.');
        });
});

// Function to validate the data structure
function validateData(obj) {
    if (obj.type !== "distributors") {
        throw new Error('Error: Data type is not "distributors".');
    }

    if (!Array.isArray(obj.attributes)) {
        throw new Error('Error: Data attributes is not an array.');
    }
}

// Create a global object to store genealogy-related data and functions
var genealogyApp = {
    genealogyData: new Object(), // Using an object to store genealogy data
    setgenealogyData: function(data) {
        let tmpData = {
            id: data.distributor_id,
            username: data.username || '',
            full_name: data.full_name || '',
            status: data.status || 'Inactive',
            product_name: data.product_name || '',
            category_name: data.category_name || '',
            parent_id: data.parent_id,
            binary_placement: data.binary_placement || '',
            children: []
        }
        // If the parent_id exists, add this data to the parent's children array
        if (this.getgenealogyData(tmpData.parent_id)) {
            this.genealogyData[tmpData.parent_id].children.push(tmpData.id);
        }
        this.genealogyData[tmpData.id] = tmpData;

        if(data.children && data.children.length > 0) {
            data.children.forEach(child => {
                // Recursively set genealogy data for each child
                this.setgenealogyData(child);
            });
        }
    },
    getgenealogyData: function(id, recurse = true) {
        if (!this.genealogyData[id]) {
            return null; // Return null if the ID does not exist
        }
        return {
            id: this.genealogyData[id].id,
            username: this.genealogyData[id].username,
            full_name: this.genealogyData[id].full_name,
            status: this.genealogyData[id].status,
            product_name: this.genealogyData[id].product_name,
            category_name: this.genealogyData[id].category_name,
            parent_id: this.genealogyData[id].parent_id,
            binary_placement: this.genealogyData[id].binary_placement,
            children: recurse ? this.genealogyData[id].children.map(child => this.getgenealogyData(child,false)) : []
        };
    }
};

// Function to display the genealogy data in a structured format
function displaygenealogyData(id) {
    const container = document.getElementById('genealogyContainer');
    container.innerHTML = ''; // Clear previous content
    let displayData = genealogyApp.getgenealogyData(id);

    // Create a root element for the genealogy tree
    const rootElement = document.createElement('div');
    rootElement.className = 'genealogy-node';
    rootElement.innerHTML = '<strong data-id="' + displayData.id + '">' + displayData.full_name + '</strong> (' + displayData.username + ')';

    // Recursively build the genealogy tree
    buildgenealogyTree(rootElement, displayData);

    container.appendChild(rootElement);
    let parentId = displayData.parent_id || null;
    // If there is a parent, display the parent information
    if (parentId) {
        const parentData = genealogyApp.getgenealogyData(parentId);
        if (parentData) {
            const parentElement = document.createElement('strong');
            parentElement.innerHTML = '<strong data-id="'+parentData.id+'">' + parentData.full_name + '</strong> (' + parentData.username + ')<br>';
            rootElement.prepend(parentElement);
        }
    }
}

// Function to recursively build the genealogy tree
function buildgenealogyTree(parentElement, data) {
    //Validate the data before proceeding
    if (!data || !data.children || data.children.length === 0) {
        return;
    }

    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'genealogy-children';

    data.children.forEach(child => {
        const childElement = document.createElement('div');
        childElement.className = 'genealogy-node';
        childElement.innerHTML = `
            <strong>${child.full_name}</strong> (${child.username})<br>
            Status: ${child.status}<br>
            Product: ${child.product_name}<br>
            Category: ${child.category_name}
        `;
        childElement.dataset.id = child.id;

        childrenContainer.appendChild(childElement);
    });

    parentElement.appendChild(childrenContainer);
}

// Handle click events
document.getElementById('genealogyContainer').addEventListener('click', function(event) {
    const targetNode = event.target.dataset.id || null
    if (targetNode) {
        const nodeId = parseInt(targetNode.trim());
        if (nodeId) {
            displaygenealogyData(nodeId);
        }
    }
});