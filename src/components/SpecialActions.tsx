import React, {useState} from 'react';
import {Accordion, Button, Modal} from 'react-bootstrap';


const SpecialActions: React.FC = () => {
    const [showConfirm, setShowConfirm] = useState(false);


    const parseClipboardData = (text: string): Record<string, string> => {
        const data = JSON.parse(text);
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            throw new Error("Clipboard data must be a JSON object with string key-value pairs.");
        }

        for (const [key, value] of Object.entries(data)) {
            if (typeof key !== 'string' || typeof value !== 'string') {
                throw new Error("All keys and values must be strings.");
            }
        }

        return data as Record<string, string>;
    };

    const handleImportFromClipboard = async (): Promise<void> => {
        try {
            let text: string | null;
            if (navigator.clipboard?.readText) {
                text = await navigator.clipboard.readText();
            } else {
                text = prompt("Paste your full localStorage JSON here:");
                if (!text) throw new Error("No data provided.");
            }

            const imported: Record<string, string> = parseClipboardData(text);

            for (const [key, value] of Object.entries(imported)) {
                localStorage.setItem(key, value);
            }

            alert("Successfully imported localStorage from clipboard.");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Failed to import from clipboard. Make sure the format is correct JSON.");
        }
    };

    const handleCopyStorage = async (): Promise<void> => {
        try {
            const allStorage: Record<string, string> = {};

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key);
                    if (value !== null) {
                        allStorage[key] = value;
                    }
                }
            }

            const serialized = JSON.stringify(allStorage, null, 2); // Pretty JSON

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(serialized);
                alert("Entire localStorage copied to clipboard!");
            } else {
                // Fallback for mobile or unsupported clipboard APIs
                const textArea = document.createElement("textarea");
                textArea.value = serialized;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                alert("Copied to clipboard using fallback.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to copy localStorage: " + (err instanceof Error ? err.message : err));
        }
    };

    const handleResetStorage = (): void => {
        const confirmed = window.confirm("Are you sure you want to clear ALL localStorage data?");
        if (confirmed) {
            localStorage.clear();
            alert("All localStorage data cleared.");
            window.location.reload();
        }
    };


    return (
        <>
            <Accordion className="my-3">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Special Actions</Accordion.Header>
                    <Accordion.Body>
                        <div className="row g-2">
                        <div className="col-sm-12 col-md-6">
                            <Button
                            variant="primary"
                            size="sm"
                            className="w-100"
                            onClick={handleImportFromClipboard}
                            >
                            Import from Clipboard
                            </Button>
                        </div>

                        <div className="col-sm-12 col-md-6">
                            <Button
                            variant="secondary"
                            size="sm"
                            className="w-100"
                            onClick={handleCopyStorage}
                            >
                            Copy or Share My Progress
                            </Button>
                        </div>

                        <div className="col-sm-12 col-md-6">
                            <Button
                            variant="danger"
                            size="sm"
                            className="w-100"
                            onClick={() => setShowConfirm(true)}
                            >
                            Clear All Progress
                            </Button>
                        </div>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Clear</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to <strong>clear all progress</strong>? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleResetStorage}>Reset Storage</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SpecialActions;
