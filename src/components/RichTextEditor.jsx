import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
    // Quill modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    // Quill formats
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'blockquote', 'code-block',
        'link', 'image',
        'color', 'background',
        'align'
    ];

    return (
        <div className="rich-text-editor">
            <ReactQuill
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{
                    minHeight: '200px',
                    backgroundColor: 'white'
                }}
                theme="snow"
            />
            <style jsx>{`
                .rich-text-editor .ql-container {
                    min-height: 200px;
                    font-family: inherit;
                }
                .rich-text-editor .ql-editor {
                    min-height: 200px;
                    font-size: 14px;
                    line-height: 1.5;
                }
                .rich-text-editor .ql-toolbar {
                    border-top: 1px solid #e5e7eb;
                    border-left: 1px solid #e5e7eb;
                    border-right: 1px solid #e5e7eb;
                    border-bottom: none;
                }
                .rich-text-editor .ql-container {
                    border-bottom: 1px solid #e5e7eb;
                    border-left: 1px solid #e5e7eb;
                    border-right: 1px solid #e5e7eb;
                    border-top: none;
                }
                .rich-text-editor .ql-editor:focus {
                    outline: none;
                }
                .rich-text-editor .ql-toolbar:focus-within + .ql-container,
                .rich-text-editor .ql-container:focus-within {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 1px #3b82f6;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
