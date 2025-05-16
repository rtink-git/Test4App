CREATE TABLE TestSelectOne ( ID int NOT NULL UNIQUE, Text1 text NOT NULL, Text2 text  NOT NULL )

INSERT INTO dbo.TestSelectOne (ID, Text1, Text2) VALUES 
(1, 'One', 'Dam'), (2, 'Two', 'Dum'), (3, 'Three', 'Dym'),
(4, 'Four', 'Dom'), (5, 'Five', 'Dan'), (6, 'Six', 'Dam'),
(7, 'Seven', 'Dum'), (8, 'Eight', 'Dim'), (9, 'Nine', 'Dak')

CREATE TABLE TestSelectTwo ( ID int NOT NULL UNIQUE, Text1 text NOT NULL, Text2 text  NOT NULL )

INSERT INTO dbo.TestSelectTwo (ID, Text1, Text2) VALUES 
(2, 'Two', 'Dum'), (3, 'Three', 'Dym'), (4, 'Four', 'Dom'), 
(5, 'Five', 'Dan'), (6, 'Six', 'Dam'), (10, 'Ten', 'Der'), 
(11, 'Eleven', 'Dan'), (12, 'Twelve', 'Del'), (14, 'Fourteen', 'Dak')


SELECT * 
FROM dbo.TestSelectOne AS tone
JOIN dbo.TestSelectTwo AS ttwo ON tone.ID=ttwo.ID