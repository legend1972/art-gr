import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes, COMMAND_PRIORITY_LOW } from "lexical";
import { useEffect } from "react";
import { $createImageNode } from "../js/ImageNode";

export const INSERT_IMAGE_COMMAND = 'INSERT_IMAGE_COMMAND';

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (src) => {
        const imageNode = $createImageNode(src);
        $insertNodes([imageNode]);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
