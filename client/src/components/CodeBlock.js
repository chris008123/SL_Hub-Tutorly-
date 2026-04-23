import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./CodeBlock.css";

// Detects code blocks in text: ```lang\ncode\n``` or inline `code`
const parseContent = (text) => {
  const parts = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "code",
      lang: match[1] || "text",
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts;
};

// Inline code: `code`
const renderInlineCode = (text) => {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
};

const CodeBlock = ({ content }) => {
  if (!content) return null;

  const parts = parseContent(content);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="rich-content">
      {parts.map((part, i) => {
        if (part.type === "code") {
          return (
            <div key={i} className="code-block-wrap">
              <div className="code-block-header">
                <span className="code-lang">{part.lang}</span>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(part.content)}
                >
                  📋 Copy
                </button>
              </div>
              <SyntaxHighlighter
                language={part.lang}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: "0 0 8px 8px",
                  fontSize: "0.875rem",
                  lineHeight: "1.6",
                }}
                showLineNumbers={part.content.split("\n").length > 3}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
          );
        }
        return (
          <p key={i} className="rich-text">
            {renderInlineCode(part.content)}
          </p>
        );
      })}
    </div>
  );
};

export default CodeBlock;
