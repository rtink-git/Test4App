CREATE TABLE TestSelectOne ( ID int NOT NULL UNIQUE, Text1 text NOT NULL, Text2 text  NOT NULL )

INSERT INTO dbo.TestSelectOne (ID, Text1, Text2) VALUES 
(1, 'One', 'Dam'), (2, 'Two', 'Dum'), (3, 'Three', 'Dym'), (4, 'Four', 'Dom'), (5, 'Five', 'Dan'), 
(6, 'Six', 'Dam'), (7, 'Seven', 'Dum'), (8, 'Eight', 'Dim'), (9, 'Nine', 'Dak')

CREATE TABLE TestSelectTwo ( ID int NOT NULL UNIQUE, Text1 text NOT NULL, Text2 text  NOT NULL )

INSERT INTO dbo.TestSelectTwo (ID, Text1, Text2) VALUES 
(2, 'Two', 'Dum'), (3, 'Three', 'Dym'), (4, 'Four', 'Dom'), (5, 'Five', 'Dan'), (6, 'Six', 'Dam'), 
(10, 'Ten', 'Der'), (11, 'Eleven', 'Dan'), (12, 'Twelve', 'Del'), (14, 'Fourteen', 'Dak')

SELECT tone.ID, tone.Text1, tone.Text2 FROM dbo.TestSelectOne AS tone
UNION ALL
SELECT ttwo.ID, ttwo.Text1, ttwo.Text2 FROM dbo.TestSelectTwo AS ttwo
LEFT JOIN dbo.TestSelectOne AS tone ON ttwo.ID=tone.ID WHERE tone.ID IS NULL