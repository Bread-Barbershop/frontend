export const UNSAFE_RICH_HTML = [
  '<img src=x onerror="document.body.dataset.compromised=1">',
  '<svg onload="alert(1)"></svg><script>alert(1)</script>',
  '<a href="javascript:alert(1)">링크</a>',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  '<p style="position:fixed;inset:0;background-image:url(https://attacker.test)">내용</p>',
];
