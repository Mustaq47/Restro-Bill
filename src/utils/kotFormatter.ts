import { Order, OrderItem } from '../types';

/**
 * Formats an order and its items into a clean, text-based Kitchen Order Ticket (KOT)
 * optimized for standard 80mm (40 or 42 characters per line) thermal receipt printers.
 * 
 * Supports localized translation mapping for uneducated/analog kitchen staff.
 */

// Simple pre-configured local language dictionary (e.g., Hindi/Regional names)
// to bridge the gap for uneducated/analog kitchen staff who cannot read English menus.
export const KITCHEN_TRANSLATIONS: Record<string, string> = {
  "Butter Chicken": "बटर चिकन (Butter Chicken)",
  "Garlic Naan": "लहसुन नान (Garlic Naan)",
  "Paneer Butter Masala": "पनीर मसाला (Paneer Masala)",
  "Jeera Rice": "जीरा चावल (Jeera Rice)",
  "Dal Makhani": "दाल मखनी (Dal Makhani)",
  "Masala Chai": "मसाला चाय (Masala Chai)",
  "Mango Lassi": "मैंगो लस्सी (Mango Lassi)",
  "Samosa (2pcs)": "समोसा 2 पीस (Samosa)",
  "Crispy Spring Rolls": "स्प्रिंग रोल (Spring Roll)",
  "Spicy Hunan Noodles": "तीखा नूडल्स (Spicy Noodles)"
};

export function formatKitchenReceipt(
  order: Order,
  items: OrderItem[],
  language: 'EN' | 'LOCAL' = 'LOCAL'
): string {
  const lineLength = 40; // Standard 80mm line width is ~40-42 characters in monospaced font
  const separator = "-".repeat(lineLength);
  const doubleSeparator = "=".repeat(lineLength);

  let output: string[] = [];

  // 1. Header Block (KOT indicator)
  output.push("=".repeat(12) + " KITCHEN ORDER " + "=".repeat(13));
  output.push(centerText(`TABLE #: ${order.table_number}`, lineLength));
  output.push(doubleSeparator);

  // 2. Metadata Block
  const orderTime = new Date(order.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  output.push(`Date: ${orderDate}`);
  output.push(`Time: ${orderTime}`);
  output.push(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`);
  output.push(separator);

  // 3. Columns Header
  // Format: QTY   ITEM NAME
  // Note: Kitchen doesn't need price info, just QTY and Names/Notes.
  output.push(padRight("QTY", 6) + "ITEM DESCRIPTION");
  output.push(separator);

  // 4. Order Items Block
  items.forEach((item) => {
    const qtyStr = `${item.quantity}x`.padEnd(6);
    let displayName = item.name;

    if (language === 'LOCAL' && KITCHEN_TRANSLATIONS[item.name]) {
      displayName = KITCHEN_TRANSLATIONS[item.name];
    }

    // Wrap item name if it's longer than standard space
    const maxNameLength = lineLength - 6;
    if (displayName.length <= maxNameLength) {
      output.push(qtyStr + displayName);
    } else {
      // Simple multi-line wrap
      const words = displayName.split(" ");
      let currentLine = "";
      words.forEach((word, index) => {
        if ((currentLine + word).length <= maxNameLength) {
          currentLine += (currentLine === "" ? "" : " ") + word;
        } else {
          output.push(index === 0 ? qtyStr + currentLine : " ".repeat(6) + currentLine);
          currentLine = word;
        }
      });
      if (currentLine !== "") {
        output.push(output.length === 0 ? qtyStr + currentLine : " ".repeat(6) + currentLine);
      }
    }
  });

  output.push(separator);

  // 5. Chef/Kitchen Instructions Notes
  if (order.notes && order.notes.trim() !== "") {
    output.push("⚠️ KITCHEN INSTRUCTIONS:");
    // Wrap notes
    const noteLines = wrapText(order.notes.trim(), lineLength - 2);
    noteLines.forEach(line => output.push(`  ${line}`));
    output.push(separator);
  }

  // 6. Footer Block (End of Ticket indicators for tearing)
  output.push(centerText("*** [START PREPARING NOW] ***", lineLength));
  output.push("\n\n\n"); // Extra paper feed spacing for standard receipt printer tear-offs

  return output.join("\n");
}

/**
 * Centers text inside a specific line length.
 */
function centerText(text: string, len: number): string {
  if (text.length >= len) return text.slice(0, len);
  const leftPad = Math.floor((len - text.length) / 2);
  const rightPad = len - text.length - leftPad;
  return " ".repeat(leftPad) + text + " ".repeat(rightPad);
}

/**
 * Pads text with space to the right up to specific length.
 */
function padRight(text: string, len: number): string {
  if (text.length >= len) return text.slice(0, len);
  return text + " ".repeat(len - text.length);
}

/**
 * Wraps long texts into lines of specified length.
 */
function wrapText(text: string, len: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length <= len) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine !== "") lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine !== "") lines.push(currentLine);
  return lines;
}
