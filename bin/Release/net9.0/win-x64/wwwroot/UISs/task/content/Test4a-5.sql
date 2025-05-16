CREATE TABLE TestXML ( 
	ID int PRIMARY KEY, 
	Code varchar(64) NOT NULL, 
	Name nvarchar(64)  NOT NULL, 
	StatusId int NOT NULL 
)


INSERT INTO dbo.TestXML (ID, Code, Name, StatusId) VALUES 
(1, 'gargadgadfga', N'Запрос предложений 1', 45), 
(2, 'bsftrggdfgadfgdfat', N'Запрос предложений 2', 2), 
(3, 'gfadgdfsgdfsgs', N'Запрос предложений 3', 45), 
(4, 'afgereaerffdgvdf', N'Запрос предложений 4', 3), 
(5, 'dgadfterdsgsdgad', N'Запрос предложений 5', 45), 
(6, 'argrgag', N'Запрос предложений 6', 2)



SELECT *
FROM dbo.TestXML
WHERE StatusId != 3
FOR XML path('row'), ROOT('data')