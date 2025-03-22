import { languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

export default function getLogoLanguagePrismModel(keywords : string[]) {
    return languages.extend('clike', {
      keyword: new RegExp(`\\b(?:${keywords.join('|')})\\b`),
      number: /\b(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
      operator: {
          pattern: /(^|[^.])(?:\+\+|--|&&|\|\||->|=>|<<|>>>?|==|!=|[<>]=?|[+\-*/%&|^=!<>])(?!=)/,
          lookbehind: true
      },
      string: {
        pattern: /"(?:\\.|[^"\\])*"/, // Only double-quoted strings
        greedy: true
      },    
      charlikeNumber: {
        pattern: /'(?:\\.|[^\s\\])/, // Matches `'a` or `'\n`
        alias: 'number'
      }
    });
  }
  