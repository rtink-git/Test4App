USE [foura_db]
GO
/****** Object:  StoredProcedure [dbo].[TransferMoney]    Script Date: 15/05/2025 02:05:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: rtink.git@gmil.com
-- Create date: 2025-05-15
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[TransferMoney]
    @NFrom CHAR(20),   -- Sender account number
    @NTo CHAR(20),     -- Recipient account number
    @SUM DECIMAL(18, 2) -- Transfer amount
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentBalance DECIMAL(18, 2);
    DECLARE @TransactionName VARCHAR(32) = 'MoneyTransfer';

	BEGIN TRY
		BEGIN TRANSACTION @TransactionName;

		IF @SUM <= 0 
		BEGIN
			ROLLBACK TRANSACTION @TransactionName;
			RETURN -1;
		END

		IF NOT EXISTS (SELECT 1 FROM dbo.BankAccounts WHERE N = @NFrom)
        BEGIN
            ROLLBACK TRANSACTION @TransactionName;
            RETURN -2;
        END

		IF NOT EXISTS (SELECT 1 FROM dbo.BankAccounts WHERE N = @NTo)
        BEGIN
            ROLLBACK TRANSACTION @TransactionName;
            RETURN -3;
        END

		SELECT @CurrentBalance = S FROM dbo.BankAccounts WITH (UPDLOCK) WHERE N = @NFrom;

        IF @CurrentBalance < @SUM
        BEGIN
            ROLLBACK TRANSACTION @TransactionName;
            RETURN -4;
        END

        UPDATE dbo.BankAccounts SET S = S - @SUM WHERE N = @NFrom;
        UPDATE dbo.BankAccounts SET S = S + @SUM WHERE N = @NTo;
		
        COMMIT TRANSACTION @TransactionName;
        
        RETURN 0;
    END TRY
    BEGIN CATCH	
		IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION @TransactionName;
		RETURN -100;
	END CATCH
END
