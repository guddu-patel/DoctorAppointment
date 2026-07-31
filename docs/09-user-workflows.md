# 09 — User Workflows

## Patient

1. Register / Login  
2. Browse `/doctors` or open **Book Visit**  
3. Select department → doctor → date → available slot  
4. Submit booking → status `PENDING` → notification  
5. Visit clinic → staff check-in → doctor consults  
6. View prescription under **Prescriptions**  
7. Pay pending invoice under **Payments**  
8. Optionally rate doctor (API `POST /reviews`)

## Doctor

1. Login → **Doctor workspace**  
2. Review **Today’s Queue**  
3. Accept (`CONFIRMED`) or Reject (`REJECTED`) pending visits  
4. Check-in when patient arrives  
5. Open **Prescribe** form → diagnosis + medicines  
6. Saving prescription marks appointment `COMPLETED`  
7. Manage weekly hours under **Availability**

## Staff / Reception

1. Login → reception dashboard  
2. Verify appointments; **Confirm** / **Check-in** / **Cancel** / **No-show**  
3. Register walk-in patient (+ optional same-day booking)  
4. Create invoice on **Billing**; collect payment  
5. Monitor **Live Queue** per doctor

## Admin

1. Login → analytics (doctors, patients, revenue, today’s load)  
2. Maintain **Departments** and **Doctors**  
3. Manage **Staff** accounts  
4. Review all **Appointments** and **Billing** reports  
5. Inspect notifications / (API) audit logs

## End-to-end happy path

```
Patient books → Doctor confirms → Staff checks in
→ Doctor prescribes (complete) → Staff generates bill → Patient pays
```
