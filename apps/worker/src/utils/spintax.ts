/**
 * Staff Engineer Logic: Spintax Parser
 * Hỗ trợ định dạng: {Chào|Hi|Hello} bạn {nhé|nha|.}
 * Xử lý Edge Case: Không có ngoặc, ngoặc rỗng, hoặc nội dung không có dấu gạch đứng.
 */
export function parseSpintax(text: string): string {
  // Regex tìm kiếm các khối nằm trong cặp ngoặc nhọn {abc|xyz}
  const spintaxRegex = /\{([^{}]+)\}/g;

  let result = text;
  let match;

  // Lặp cho đến khi không còn cặp ngoặc nào (hỗ trợ nested spintax nếu cần)
  while ((match = spintaxRegex.exec(result)) !== null) {
    const fullMatch = match[0]; // {Chào|Hi}
    const options = match[1].split('|'); // ["Chào", "Hi"]
    
    // Chọn ngẫu nhiên một phần tử
    const randomIndex = Math.floor(Math.random() * options.length);
    const selected = options[randomIndex].trim();
    
    // Thay thế khối spintax bằng giá trị đã chọn
    result = result.replace(fullMatch, selected);
    
    // Reset lại index của regex để quét lại từ đầu (đảm bảo xử lý hết)
    spintaxRegex.lastIndex = 0;
  }

  return result;
}