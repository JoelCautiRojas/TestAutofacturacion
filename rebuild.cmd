@echo off
:: Regenera todos los sections/*.js desde sus correspondientes *.html
powershell -ExecutionPolicy Bypass -NoProfile -Command ^
  "$base='%~dp0sections'; Get-ChildItem '$base\*.html' | ForEach-Object { $id=$_.BaseName; $c=[System.IO.File]::ReadAllText($_.FullName,[System.Text.Encoding]::UTF8); $c=$c-replace'``','\``'; $c=$c-replace'\$\{','\\${'; $js='/* section: '+$id+' */'+'`n(function(){'+'`n  var c=document.getElementById(''view-container'');'+'`n  if(c) c.insertAdjacentHTML(''beforeend'', ``'+$c+'``);'+'`n'+'})();'; [System.IO.File]::WriteAllText(\"$base\$id.js\",$js,[System.Text.Encoding]::UTF8); Write-Host \"Rebuilt: $id.js\" }"
echo.
echo Listo. Recarga el navegador (F5).
pause
