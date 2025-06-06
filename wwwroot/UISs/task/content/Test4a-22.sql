-- appWebA4GR.MapGet("/GetAllBooks", async (HttpContext context) => {
--     var l = await new RtInkApi.DBProviders.foura_dbMSSQL.Client().GetStringAsync($"EXEC BooksSP_DoApp");
--     if (l == null) return Results.BadRequest();
--     return Results.Json(JsonSerializer.Deserialize<object>(l));
-- });

ALTER PROCEDURE [dbo].[BooksSP_DoApp]
AS
BEGIN
	SET NOCOUNT ON;

    SELECT ID, Namee, Author, Yearr FROM dbo.Books FOR JSON PATH
END

-- appWebA4GR.MapGet("/GetBook", async (int id, HttpContext context) => {
--     var m = await new RtInkApi.DBProviders.foura_dbMSSQL.Client().GetStringAsync($"EXEC BookSP_DoApp {id}");
--     if (m == null) return Results.BadRequest();
--     return Results.Json(JsonSerializer.Deserialize<object>(m));
-- });

ALTER PROCEDURE [dbo].[BookSP_DoApp] 
	@id int
AS
BEGIN
	SET NOCOUNT ON;

    SELECT TOP 1 ID, Namee, Author, Yearr, TableOfContents FROM dbo.Books WHERE ID=@id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
END

-- app.MapDelete($"{UR_WebAppA4}/DeleteBook", async (int id, HttpContext context) => {
--     var parameters = new[]
--     {
--         new SqlParameter("@id", id)
--     };
    
--     var result = await new RtInkApi.DBProviders.foura_dbMSSQL.Client()
--         .ExecuteStoredProcedureAsync("BookDelSP_DoApp", parameters);
    
--     return result switch
--     {
--         1 => Results.Ok(),
--         0 => Results.NotFound(),
--         _ => Results.StatusCode(500)
--     };
-- }).RequireCors(RtInkCorsPolicy);

CREATE PROCEDURE BookDelSP_DoApp 
	@id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DELETE FROM dbo.Books WHERE ID = @id;
        
        IF @@ROWCOUNT > 0
        BEGIN
            COMMIT TRANSACTION;
            RETURN 1;
        END
        ELSE
        BEGIN
            ROLLBACK TRANSACTION;
            RETURN 0;
        END
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        RETURN -1;
    END CATCH
END

-- app.MapPost($"{UR_WebAppA4}/UpdateBook", async (HttpContext context) => {
--     try {
--         // Read and parse the JSON body
--         var bookData = await context.Request.ReadFromJsonAsync<BookUpdateModel>();
--         if (bookData == null)
--             return Results.BadRequest("Invalid book data");

--         // Validate XML content
--         try {
--             if (!string.IsNullOrEmpty(bookData.TableOfContents))
--             {
--                 var xmlDoc = XDocument.Parse(bookData.TableOfContents);
--             }
--         }
--         catch (Exception xmlEx)
--         {
--             return Results.BadRequest($"Invalid XML format in TableOfContents: {xmlEx.Message}");
--         }

--         var parameters = new SqlParameter[]
--         {
--             new SqlParameter("@ID", bookData.ID),
--             new SqlParameter("@Name", bookData.Name ?? string.Empty),
--             new SqlParameter("@Author", bookData.Author ?? string.Empty),
--             new SqlParameter("@Year", bookData.Year),
--             new SqlParameter("@TableOfContents", bookData.TableOfContents ?? string.Empty)
--         };

--         var result = await new RtInkApi.DBProviders.foura_dbMSSQL.Client().ExecuteStoredProcedureAsync(
--             "dbo.BookUpdateSP_DoApp",
--             parameters);

--         return result switch
--         {
--             1 => Results.Ok(),
--             0 => Results.NotFound(),
--             -1 => Results.Problem("Database error occurred"),
--             _ => Results.StatusCode(500)
--         };
--     }
--     catch (JsonException jsonEx)
--     {
--         return Results.BadRequest($"Invalid JSON format: {jsonEx.Message}");
--     }
--     catch (Exception ex)
--     {
--         return Results.Problem(ex.Message);
--     }
-- }).RequireCors(RtInkCorsPolicy);

ALTER PROCEDURE [dbo].[BookUpdateSP_DoApp]
    @ID INT,
    @Name NVARCHAR(255),
    @Author NVARCHAR(255),
    @Year INT,
    @TableOfContents NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Result INT = 0;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if the book exists
        IF NOT EXISTS (SELECT 1 FROM dbo.Books WHERE ID = @ID)
        BEGIN
            SET @Result = 0; -- Not found
        END
        ELSE
        BEGIN
            -- Update the book information
            UPDATE dbo.Books
            SET 
                Namee = @Name, 
                Author = @Author, 
                Yearr = @Year, 
                TableOfContents = TRY_CAST(@TableOfContents AS XML) -- Safely cast to XML
            WHERE ID = @ID;
            
            SET @Result = @@ROWCOUNT; -- 1 if updated, 0 if not
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Result = -1; -- Error
    END CATCH
    
    -- Return as integer value
    RETURN @Result;
END

-- app.MapPost($"{UR_WebAppA4}/InsertBook", async (HttpContext context) => {
--     try {
--         // Чтение и парсинг JSON тела запроса
--         var bookData = await context.Request.ReadFromJsonAsync<BookUpdateModel>();
--         if (bookData == null)
--             return Results.BadRequest("Invalid book data");

--         // Проверка, что ID равен 0 (новая книга)
--         if (bookData.ID != 0)
--             return Results.BadRequest("ID must be 0 for new books");

--         // Валидация XML содержимого
--         try {
--             if (!string.IsNullOrEmpty(bookData.TableOfContents)) {
--                 var xmlDoc = XDocument.Parse(bookData.TableOfContents);
--             }
--         }
--         catch (Exception xmlEx) {
--             return Results.BadRequest($"Invalid XML format in TableOfContents: {xmlEx.Message}");
--         }

--         // Параметры для хранимой процедуры
--         var parameters = new SqlParameter[] {
--             new SqlParameter("@Name", bookData.Name ?? string.Empty),
--             new SqlParameter("@Author", bookData.Author ?? string.Empty),
--             new SqlParameter("@Year", bookData.Year),
--             new SqlParameter("@TableOfContents", bookData.TableOfContents ?? string.Empty)
--         };

--         // Вызов хранимой процедуры для вставки
--         var newId = await new RtInkApi.DBProviders.foura_dbMSSQL.Client()
--             .ExecuteStoredProcedureAsync("dbo.BookInsertSP_DoApp", parameters);

--         return Results.Ok(new
--         {
--             success = true,
--             Id = newId,
--             message = "Book created successfully"
--         });
--     }
--     catch (JsonException jsonEx) {
--         return Results.BadRequest($"Invalid JSON format: {jsonEx.Message}");
--     }
--     catch (Exception ex) {
--         return Results.Problem(ex.Message);
--     }
-- }).RequireCors(RtInkCorsPolicy);

ALTER PROCEDURE [dbo].[BookInsertSP_DoApp]
    @Name NVARCHAR(255),
    @Author NVARCHAR(255),
    @Year INT,
    @TableOfContents NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NewID INT;

    BEGIN TRY
        -- Валидация входных данных
        IF NULLIF(@Name, '') IS NULL
            THROW 51000, 'Book name cannot be empty', 1;

        IF NULLIF(@Author, '') IS NULL
            THROW 51000, 'Author name cannot be empty', 1;

        IF @Year IS NULL OR @Year < 0 OR @Year > YEAR(GETDATE()) + 5
            THROW 51000, 'Invalid year value', 1;

        -- Валидация XML, если содержимое указано
        IF NULLIF(@TableOfContents, '') IS NOT NULL
        BEGIN
            DECLARE @XmlContent XML = TRY_CAST(@TableOfContents AS XML);
            IF @XmlContent IS NULL
                THROW 51000, 'Invalid XML format in TableOfContents', 1;
        END

        BEGIN TRANSACTION;

        -- Вставка записи
        INSERT INTO dbo.Books (
            Namee, 
            Author, 
            Yearr, 
            TableOfContents
        )
        VALUES (
            @Name, 
            @Author, 
            @Year, 
            CASE WHEN NULLIF(@TableOfContents, '') IS NULL THEN NULL 
                 ELSE TRY_CAST(@TableOfContents AS XML) END
        );

        -- Получение нового ID
        SET @NewID = SCOPE_IDENTITY();

        IF @NewID IS NULL
            THROW 51000, 'Failed to insert book record', 1;

        COMMIT TRANSACTION;

        RETURN @NewID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Пробрасываем сообщение об ошибке дальше
        THROW;
    END CATCH
END