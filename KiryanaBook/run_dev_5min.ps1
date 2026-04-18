$p = Start-Process cmd.exe -ArgumentList "/c npm run dev" -WorkingDirectory "z:\last cash book\KiryanaBook" -PassThru
Write-Host "Localhost running on http://localhost:5173"
Start-Sleep -Seconds 300
Stop-Process -Id $p.Id -Force
Write-Host "Localhost stopped automatically after 5 minutes."
